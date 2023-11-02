import type { Amount, Box } from "@fleet-sdk/core";

export interface ReputationProof {
    box: Box<Amount>,
    box_id: string,
    token_id: string,
    metadata: any
}