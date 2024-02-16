import type { ReputationProof } from "$lib/ReputationProof";
import type { Amount, Box } from "@fleet-sdk/core";


/**
    https://api.ergoplatform.com/api/v1/docs/#operation/postApiV1BoxesUnspentSearch
*/

export async function updateReputationProofList(explorer_uri: string, ergo_tree_template_hash: string, ergo: any): Promise<ReputationProof[]> {
    try {
        const response = await fetch(explorer_uri+'/api/v1/boxes/unspent/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                "ergoTreeTemplateHash": ergo_tree_template_hash,
                "registers": {
                    // "R4": "reputation-proof-token",
                    // "R7": await ergo.get_change_address()
                },
                "constants": {},
                "assets": []
            }),
        });

        if (response.ok) {
            const data = await response.json(); // Suponiendo que la respuesta es un objeto JSON
            console.log('Unspent reputation proofs -> ', data)
            return data.items.map((e: any) => {
                return {
                    box: e,
                    box_id: e.boxId,
                    token_id: e.assets.length > 0 ? e.assets[0].tokenId : "",
                    metadata: e
                }
            }); // Actualiza las opciones con los datos recibidos
        } else {
            console.error('Error al realizar la solicitud POST');
            return [];
        }
    } catch (error) {
        console.error('Error al procesar la solicitud POST:', error);
        return [];
    }
}