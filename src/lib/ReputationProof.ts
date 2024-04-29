import type { Amount, Box } from "@fleet-sdk/core";
import { stringToRendered } from "./utils";

export interface ReputationProof {
    token_id: string,
    current_boxes: RPBox[],
    total_amount: number,
    number_of_boxes: number,
    network: Network,
    can_be_spend: boolean
}

export function token_rendered(proof: ReputationProof): string {
    return stringToRendered(proof.token_id);
};

export const reputation_token_label = "RPT";

export enum ObjectType {
    PlainText = "plain/txt-utf8",
    ProofByToken = "token-proof"
}

export function object_type_by_rendered_value(value: string): ObjectType {
    for (const objectType of Object.values(ObjectType)) {
        if (stringToRendered(objectType) === value) {
            return objectType as ObjectType;
        }
    }
    return ObjectType.PlainText;
}

export interface RPBox {
    box: Box<Amount>,
    token_id: string,
    box_id: string,
    token_amount: number,
    object_type?: ObjectType,
    object_value?: string
}

export enum Network {
    ErgoTestnet = "ergo-testnet",
    ErgoMainnet = "ergo-mainnet",
    BitcoinTestnet = "btc-testnet",
    BitcoinMainnet = "btc-mainnet"
}