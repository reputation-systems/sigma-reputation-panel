import type { Amount, Box } from "@fleet-sdk/core";
import { stringToRendered } from "./utils";

export interface ReputationProof {
    token_id: string,
    current_boxes: RPBox[],
    total_amount: number,
    number_of_boxes: number
}

export function token_rendered(proof: ReputationProof): string {
    return stringToRendered(proof.token_id);
};

export enum ObjectType {
    PlainText = "plain/txt-utf8",
    ProofByToken = "token-proof"
}

export interface RPBox {
    box: Box<Amount>,
    token_id: string,
    box_id: string,
    token_amount: number,
    object_type?: ObjectType,
    object_value?: string
}