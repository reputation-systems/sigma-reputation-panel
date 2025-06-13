import { Network, type RPBox, type ReputationProof, type TypeNFT } from "$lib/ReputationProof";
import { check_if_r7_is_local_addr, generate_pk_proposition, hexToUtf8, serializedToRendered } from "$lib/utils";
import { get } from "svelte/store";
import { connected, types } from "./store";
import { digital_public_good_contract_hash, ergo_tree_hash, explorer_uri } from "./envs";

type RegisterValue = { renderedValue: string; serializedValue: string; };
type ApiBox = {
    boxId: string; value: string | bigint; assets: { tokenId: string; amount: string | bigint }[]; ergoTree: string; creationHeight: number;
    additionalRegisters: {
        R4?: RegisterValue; R5?: RegisterValue; R6?: RegisterValue; R7?: RegisterValue; R8?: RegisterValue; R9?: RegisterValue;
    };
    index: number; transactionId: string;
};

function parseR6(r6RenderedValue: string): { isLocked: boolean; totalSupply: number } {
    try {
        const [lockedStr, supplyStr] = r6RenderedValue.replace(/[()\[\]]/g, '').split(',');
        return { isLocked: lockedStr.trim() === 'true', totalSupply: Number(supplyStr.trim()) };
    } catch (e) {
        console.warn("Could not parse R6 tuple, returning defaults:", r6RenderedValue, e);
        return { isLocked: true, totalSupply: 0 };
    }
}

export async function fetchTypeNfts() {
    try {
        const url = `${explorer_uri}/api/v1/boxes/unspent/search`;
        const body = { "ergoTreeTemplateHash": digital_public_good_contract_hash };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Failed to fetch type boxes from the explorer.");
        
        const data = await response.json();
        const fetchedTypesArray = data.items.map((box: any): TypeNFT | null => {
            if (!box.assets || box.assets.length === 0) return null;
            return {
                tokenId: box.assets[0].tokenId,
                boxId: box.boxId,
                typeName: hexToUtf8(box.additionalRegisters.R4?.renderedValue || '') ?? "",
                description: hexToUtf8(box.additionalRegisters.R5?.renderedValue || '') ?? "",
                schemaURI: hexToUtf8(box.additionalRegisters.R6?.renderedValue || '') ?? "",
                version: hexToUtf8(box.additionalRegisters.R7?.renderedValue || '') ?? "",
            };
        }).filter((t: TypeNFT | null): t is TypeNFT => t !== null);
        
        const typesMap = new Map(fetchedTypesArray.map(type => [type.tokenId, type]));
        types.set(typesMap);
        console.log(`Successfully fetched and stored ${typesMap.size} Type NFTs.`);

    } catch (e: any) {
        console.error("Failed to fetch and store types:", e);
        types.set(new Map());
    }
}

export async function updateReputationProofList(
    ergo: any, 
    all: boolean, 
    search: string | null
): Promise<Map<string, ReputationProof>> {

    await fetchTypeNfts();
    const availableTypes = get(types);

    if (!get(connected)) all = true;

    const proofs = new Map<string, ReputationProof>();
    const search_bodies = [];
    const change_address = get(connected) && ergo ? await ergo.get_change_address() : null;
    const r7_filter = !all && change_address ? { "R7": generate_pk_proposition(change_address) } : {};

    if (search) {
        search_bodies.push({ assets: [search] });
        search_bodies.push({ registers: { "R5": hexToUtf8(search) } }); 
        search_bodies.push({ registers: { "R4": hexToUtf8(search) } }); 
        try { search_bodies.push({ registers: { "R7": generate_pk_proposition(search) } }); }
        catch (e) { console.log("Search term is not a valid address, skipping R7 search."); }
    } else {
        search_bodies.push({});
    }

    try {
        for (const body_part of search_bodies) {
            let offset = 0, limit = 100, moreDataAvailable = true;
            while (moreDataAvailable) {
                const url = `${explorer_uri}/api/v1/boxes/unspent/search?offset=${offset}&limit=${limit}`;
                const final_body = { "ergoTreeTemplateHash": ergo_tree_hash, "registers": { ...(body_part.registers || {}), ...r7_filter }, "assets": body_part.assets || [] };
                const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(final_body) });

                if (!response.ok) { moreDataAvailable = false; continue; }
                const json_data = await response.json();
                if (json_data.items.length === 0) { moreDataAvailable = false; continue; }

                for (const box of json_data.items as ApiBox[]) {
                    if (!box.assets?.length || !box.additionalRegisters.R4 || !box.additionalRegisters.R6) continue;

                    const rep_token_id = box.assets[0].tokenId;
                    let proof = proofs.get(rep_token_id);

                    const type_nft_id_for_box = hexToUtf8(box.additionalRegisters.R4.renderedValue) ?? "";
                    let typeNftForBox = availableTypes.get(type_nft_id_for_box);
                    if (!typeNftForBox) {
                        console.log(`TypeNFT with ID ${type_nft_id_for_box} not found in store. Creating a default for this box.`);
                        typeNftForBox = { tokenId: type_nft_id_for_box, boxId: '', typeName: "Unknown Type", description: "Metadata not found", schemaURI: "", version: "0.0" };
                    }
                    
                    if (!proof) {
                        const r6_parsed = parseR6(box.additionalRegisters.R6.renderedValue);
                        const r7_value = box.additionalRegisters.R7?.serializedValue ?? "";

                        proof = {
                            token_id: rep_token_id,
                            type: { tokenId: "", boxId: '', typeName: "N/A", description: "...", schemaURI: "", version: "" },
                            total_amount: r6_parsed.totalSupply,
                            owner_address: serializedToRendered(r7_value),
                            can_be_spend: await check_if_r7_is_local_addr(r7_value),
                            current_boxes: [],
                            number_of_boxes: 0,
                            network: Network.ErgoMainnet,
                            data: {}
                        };
                    }

                    let box_content = {};
                    try { box_content = box.additionalRegisters.R9 ? JSON.parse(hexToUtf8(box.additionalRegisters.R9.serializedValue) ?? "") : {}; }
                    catch (jsonError) { console.warn(`Failed to parse R9 JSON for box ${box.boxId}:`, jsonError); }
                    
                    const object_pointer_for_box = hexToUtf8(box.additionalRegisters.R5?.renderedValue ?? "") ?? "";

                    const current_box: RPBox = {
                        box: {
                            boxId: box.boxId, value: box.value, assets: box.assets, ergoTree: box.ergoTree, creationHeight: box.creationHeight,
                            additionalRegisters: Object.entries(box.additionalRegisters).reduce((acc, [key, value]) => { acc[key] = value.serializedValue; return acc; }, {} as { [key: string]: string; }),
                            index: box.index, transactionId: box.transactionId
                        },
                        box_id: box.boxId,
                        type: typeNftForBox,
                        token_id: rep_token_id,
                        token_amount: Number(box.assets[0].amount),
                        object_pointer: object_pointer_for_box,
                        is_locked: parseR6(box.additionalRegisters.R6.renderedValue).isLocked,
                        polarization: box.additionalRegisters.R8?.renderedValue === 'true',
                        content: box_content,
                    };
                    
                    if (current_box.object_pointer === proof.token_id) {
                        proof.type = typeNftForBox;
                    }

                    proof.current_boxes.push(current_box);
                    proof.number_of_boxes += 1;
                    
                    proofs.set(rep_token_id, proof);
                    console.log(proof)
                }
                offset += limit;
            }
        }
        return proofs;
    } catch (error) {
        console.error('An error occurred during the reputation proof search:', error);
        return new Map();
    }
}