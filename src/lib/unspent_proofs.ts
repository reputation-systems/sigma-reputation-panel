import type { ReputationProof } from "$lib/ReputationProof";
import {
    SConstant,
    SColl,
    SByte,
    ErgoAddress,
    Network
} from '@fleet-sdk/core';
import { stringToBytes } from "@scure/base";

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

export async function updateReputationProofList(explorer_uri: string, ergo_tree_template_hash: string, ergo: any): Promise<ReputationProof[]> {

    const wallet_pk = await ergo.get_change_address();
    console.log(wallet_pk)
    const r7 = SConstant(SColl(SByte, stringToBytes('utf8', wallet_pk)));  // It's the serializedValue, but renderedValue is needed.
    console.log(r7)
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
                    "R7": r7 // 3357795339456f4a4a347a684a6632456974356d383336463669594e7961355373734b4641594838637277776253534c48787269
                },
                "constants": {},
                "assets": []
            }),
        });

        if (response.ok) {
            return (await response.json()).items.map((e: ApiBox) => {
                return {
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
                      },
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