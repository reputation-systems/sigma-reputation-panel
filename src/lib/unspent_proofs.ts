import { type RPBox, type ReputationProof, object_type_by_rendered_value, Network, ObjectType } from "$lib/ReputationProof";
import { check_if_r7_is_local_addr, generate_pk_proposition, hexToUtf8, serializedToRendered, stringToRendered, stringToSerialized } from "$lib/utils";
import { get } from "svelte/store";
import { connected } from "./store";

/**
    https://api.ergoplatform.com/api/v1/docs/#operation/postApiV1BoxesUnspentSearch
*/

type RegisterValue = {
    renderedValue: string;
    serializedValue: string;
  };

type ApiBox = {
    boxId: string;
    value: string | bigint;
    assets: { tokenId: string; amount: string | bigint }[];
    ergoTree: string;
    creationHeight: number;
    additionalRegisters: {
        R4?: RegisterValue;
        R5?: RegisterValue;
        R6?: RegisterValue;
        R7?: RegisterValue;
        R8?: RegisterValue;
        R9?: RegisterValue;
    };
    index: number;
    transactionId: string;
};

export async function getUnconfirmed(explorer_uri: string, ergo: any)
{
    const wallet_pk = await ergo.get_change_address();

    try {
        const response = await fetch(explorer_uri+'/api/v1/boxes/unspent/unconfirmed/byAddress/'+wallet_pk, {
            method: 'GET'
        });

        if (response.ok) {
            const apiData = await response.json();
            console.log(apiData)
        }        
        else {
            console.error('Error fetching unconfirmed boxes');
        }
    } catch (error) {
        console.error('Error processing unconfirmed boxes request:', error);
    }
}

export async function get_token_total_amount(explorer_uri: string, token_id: string): Promise<number> {
    try {
        const response = await fetch(`${explorer_uri}/api/v1/tokens/${token_id}`, {
            method: 'GET'
        });

        if (response.ok) {
            const tokenInfo = await response.json();
            return tokenInfo.emissionAmount;
        } else {
            console.error('Error fetching token info');
            return 0;
        }
    } catch (error) {
        console.error('Error processing token info request:', error);
        return 0;
    }
}

/**
 * Fetches and updates the list of reputation proofs based on various search strategies.
 * This function can search by token ID, plain text, address, or proof-by-token links.
 * @param explorer_uri The base URI of the Ergo explorer API.
 * @param ergo_tree_template_hash The template hash of the reputation proof contract.
 * @param ergo The ergo provider object for wallet interactions.
 * @param all If true, fetches all proofs; otherwise, only those related to the connected wallet.
 * @param search The search term. Can be anything from a token ID to plain text.
 * @returns A Map of token IDs to ReputationProof objects.
 */
export async function updateReputationProofList(explorer_uri: string, ergo_tree_template_hash: string, ergo: any, all: boolean, search: string|null): Promise<Map<string, ReputationProof>> 
{
    if (!get(connected)) all = true;

    const proofs = new Map<string, ReputationProof>();
    const search_bodies = [];

    // --- FIX: Get change address once to build the R7 filter ---
    const change_address = get(connected) && ergo ? await ergo.get_change_address() : null;
    const r7_filter = !all && change_address
        ? { "R7": generate_pk_proposition(change_address) }
        : {};

    if (search) {
        // --- POWERFUL SEARCH STRATEGIES ---
        search_bodies.push({ assets: [search] });
        search_bodies.push({ registers: { "R5": stringToSerialized(ObjectType.PlainText), "R6": stringToSerialized(search) }});
        search_bodies.push({ registers: { "R5": stringToSerialized(ObjectType.ProofByToken), "R6": stringToSerialized(search) }});
        try {
            search_bodies.push({ registers: { "R7": generate_pk_proposition(search) } });
        } catch (e) {
            console.log("Search term is not a valid address, skipping R7 search.");
        }
    } else {
        search_bodies.push({});
    }

    try {
        for (const body_part of search_bodies) {
            let params = { offset: 0, limit: 500 };
            let moreDataAvailable = true;

            while (moreDataAvailable) {
                const url = `${explorer_uri}/api/v1/boxes/unspent/search?offset=${params.offset}&limit=${params.limit}`;
                
                const final_body = {
                    "ergoTreeTemplateHash": ergo_tree_template_hash,
                    "registers": { ...(body_part.registers || {}), ...r7_filter },
                    "assets": body_part.assets || []
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(final_body),
                });

                if (response.ok) {
                    let json_data = await response.json();
                    if (json_data.items.length === 0) {
                        moreDataAvailable = false;
                        break;
                    }

                    // --- PARSING AND MERGING LOGIC (REFACTORED FOR PERFORMANCE AND SAFETY) ---
                    for (const e of json_data.items) {
                        // FIX: Safety check to ensure the box has assets before proceeding
                        if (!e.assets || e.assets.length === 0) {
                            continue;
                        }
                        const token_id = e.assets[0].tokenId;
                        
                        let _reputation_proof = proofs.get(token_id);

                        // FIX: Only create a new proof and perform slow `await` calls if it's the first time we see this token
                        if (!_reputation_proof) {
                            const r7_value = e.additionalRegisters.R7?.renderedValue ?? "";
                            const r4_value = e.additionalRegisters.R4?.renderedValue ?? "";
                            _reputation_proof = {
                                current_boxes: [], 
                                token_id: token_id,
                                number_of_boxes: 0,
                                total_amount: await get_token_total_amount(explorer_uri, token_id),
                                network: Network.ErgoMainnet,
                                can_be_spend: await check_if_r7_is_local_addr(r7_value),
                                tag: hexToUtf8(r4_value),
                                data: {}
                            };
                        }

                        // FIX: Safely parse JSON data from R9 register
                        let box_data = {};
                        try {
                            box_data = e.additionalRegisters.R9 ? JSON.parse(hexToUtf8(e.additionalRegisters.R9.renderedValue) ?? '{}') : {};
                        } catch (jsonError) {
                            console.warn(`Failed to parse R9 JSON for box ${e.boxId}:`, jsonError);
                        }
                        
                        const current_box: RPBox = {
                            box_id: e.boxId,
                            token_id: token_id,
                            token_amount: Number(e.assets[0].amount),
                            negative: e.additionalRegisters.R8?.renderedValue === "false",
                            box: {
                                boxId: e.boxId,
                                value: e.value,
                                assets: e.assets,
                                ergoTree: e.ergoTree,
                                creationHeight: e.creationHeight,
                                additionalRegisters: Object.entries(e.additionalRegisters).reduce((acc, [key, value]) => {
                                    acc[key] = value.serializedValue;
                                    return acc;
                                }, {} as { [key: string]: string; }),
                                index: e.index,
                                transactionId: e.transactionId
                            },
                            data: box_data
                        };
                    
                        if (e.additionalRegisters.R6 !== undefined && e.additionalRegisters.R5 !== undefined) {
                            current_box.object_type = object_type_by_rendered_value(e.additionalRegisters.R5.renderedValue),
                            current_box.object_value = e.additionalRegisters.R6.renderedValue;
                        }

                        _reputation_proof.current_boxes.push(current_box);
                        _reputation_proof.number_of_boxes += 1;
                        
                        if (current_box.object_type === ObjectType.ProofByToken && stringToRendered(token_id) == current_box.object_value) {
                            // Update the main proof data from a self-referential box, also safely
                            try {
                                _reputation_proof.data = JSON.parse(hexToUtf8(e.additionalRegisters.R9.renderedValue) ?? "{}");
                            } catch (jsonError) {
                                console.warn(`Failed to parse self-referential R9 JSON for box ${e.boxId}:`, jsonError);
                            }
                        }

                        proofs.set(token_id, _reputation_proof);
                    }                
                    params.offset += params.limit;
                } else {
                    console.error('Error during POST request in search loop');
                    moreDataAvailable = false; // Stop this loop on error
                }
            }
        }
        return proofs;
    } catch (error) {
        console.error('Error during powerful search execution:', error);
        return new Map();
    }
}
