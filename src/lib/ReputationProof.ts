import { SByte, type Amount, type Box, SColl, SConstant } from "@fleet-sdk/core";
import { serializedToRendered } from "./utils";
import { stringToBytes } from "@scure/base";

export interface ReputationProof {
    token_id: string,
    current_boxes: RPBox[],
    total_amount: number,
    number_of_boxes: number
}

export function token_rendered(proof: ReputationProof): string {
    return serializedToRendered(SConstant(SColl(SByte, stringToBytes('utf8', proof.token_id))));
};

export enum ObjectType {
    PlainText = "plain/txt-utf8",
    ProofByToken = "token-proof"
}

export interface RPBox {
    box_id: string,
    token_amount: number,
    object_type?: ObjectType,
    object_value?: string
}