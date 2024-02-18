import type { ReputationProof } from "$lib/ReputationProof";
import {
    SConstant,
    SColl,
    SByte
} from '@fleet-sdk/core';
import { stringToBytes } from "@scure/base";

/**
    https://api.ergoplatform.com/api/v1/docs/#operation/postApiV1BoxesUnspentSearch
*/

export async function updateReputationProofList(explorer_uri: string, ergo_tree_template_hash: string, ergo: any): Promise<ReputationProof[]> {
    console.log( stringToBytes('utf8', "RPT"))
    console.log( stringToBytes('utf8', "RPT").toString())
    console.log(SColl(SByte, stringToBytes('utf8', "RPT")).toHex())
    console.log(SColl(SByte, stringToBytes('utf8', "RPT")).toBytes())
    console.log(SConstant(SColl(SByte, stringToBytes('utf8', "RPT"))))
    try {
        const response = await fetch(explorer_uri+'/api/v1/boxes/unspent/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                "ergoTreeTemplateHash": ergo_tree_template_hash,
                "registers": {
                    "R4":  "72657075746174696f6e2d70726f6f662d746f6b656e",
                    "R7": "3357795339456f4a4a347a684a6632456974356d383336463669594e7961355373734b4641594838637277776253534c48787269"
                },
                "constants": {},
                "assets": []
            }),
        });

        if (response.ok) {
            return (await response.json()).items.map((e: any) => {
                console.log(e)
                return {
                    box: e,
                    box_id: e.boxId,
                    token_id: e.assets.length > 0 ? e.assets[0].tokenId : "",
                    token_amount: e.assets.length > 0 ? e.assets[0].amount : 0,
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