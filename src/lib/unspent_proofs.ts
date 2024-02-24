import type { ReputationProof } from "$lib/ReputationProof";
import {
    SConstant,
    SColl,
    SByte
} from '@fleet-sdk/core';
import { stringToBytes } from "@scure/base";
import { serializedToRendered } from "$lib/utils";

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
                    "R4":  serializedToRendered(SConstant(SColl(SByte, stringToBytes('utf8', "reputation-proof-token")))),
                //    "R7": serializedToRendered(generate_pk_proposition((await ergo.get_change_address())))  <-- don't work. Why?
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