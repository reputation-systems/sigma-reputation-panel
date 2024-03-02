import { ObjectType, reputation_token_label, type RPBox, type ReputationProof, object_type_by_rendered_value } from "$lib/ReputationProof";
import { generate_pk_proposition, serializedToRendered, stringToRendered } from "$lib/utils";

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

export async function updateReputationProofList(explorer_uri: string, ergo_tree_template_hash: string, ergo: any): Promise<ReputationProof[]> 
{
    const wallet_pk = await ergo.get_change_address();

    try {
        const response = await fetch(explorer_uri+'/api/v1/boxes/unspent/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                "ergoTreeTemplateHash": ergo_tree_template_hash,
                "registers": {
                    "R4":  stringToRendered(reputation_token_label),
                    "R7":  serializedToRendered(generate_pk_proposition((await ergo.get_change_address())))
                },
                "constants": {},
                "assets": []
            }),
        });

        if (response.ok) {
            let proofs = new Map<string, ReputationProof>();
            (await response.json()).items.forEach((e: ApiBox) => {
                let token_id = e.assets[0].tokenId;
                let current_box: RPBox = {
                        box_id: e.boxId,
                        token_id: e.assets.length > 0 ? e.assets[0].tokenId : "",
                        token_amount: e.assets.length > 0 ? Number(e.assets[0].amount) : 0,
                        box: {
                            boxId: e.boxId,
                            value: e.value,
                            assets: e.assets,
                            ergoTree: e.ergoTree,
                            creationHeight: e.creationHeight,
                            additionalRegisters: Object.entries(e.additionalRegisters).reduce((acc, [key, value]) => {
                                acc[key] = value.serializedValue;
                                return acc;
                            }, {} as {
                                [key: string]: string;
                            }),
                            index: e.index,
                            transactionId: e.transactionId
                        }
                    };
                
                if (e.additionalRegisters.R6 !== undefined && e.additionalRegisters.R5 !== undefined) {
                    current_box.object_type = object_type_by_rendered_value(e.additionalRegisters.R5.renderedValue),
                    current_box.object_value = e.additionalRegisters.R6.renderedValue;
                }

                let _reputation_proof: ReputationProof = proofs.has(token_id) 
                    ? proofs.get(token_id)! 
                    : {
                        current_boxes: [], 
                        token_id: token_id,
                        number_of_boxes: 0,
                        total_amount: 0
                    };
                _reputation_proof.current_boxes.push(current_box);
                _reputation_proof.total_amount += current_box.token_amount;
                _reputation_proof.number_of_boxes += 1;
                proofs.set(token_id, _reputation_proof);
            });
            return Array.from(proofs.values());
        } 
        else {
            console.error('Error al realizar la solicitud POST');
            return [];
        }
    } catch (error) {
        console.error('Error al procesar la solicitud POST:', error);
        return [];
    }
}