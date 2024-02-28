import type { Amount, Box } from "@fleet-sdk/core";

export interface ReputationProof {
    current_boxes: RPBox[]
}

export interface RPBox {
    box: Box<Amount>,
    box_id: string,
    token_id: string,
    token_amount: number
}