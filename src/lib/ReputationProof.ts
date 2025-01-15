import type { Amount, Box } from "@fleet-sdk/core";
import { stringToRendered } from "./utils";
import { proofs, compute_deep_level } from "./store";
import { get } from 'svelte/store';

export interface ReputationProof {
    token_id: string,
    current_boxes: RPBox[],
    total_amount: number,
    number_of_boxes: number,
    network: Network,
    can_be_spend: boolean,
    tag: string|null,
    data: object
}

export function token_rendered(proof: ReputationProof): string {
    return stringToRendered(proof.token_id);
};

export enum ObjectType {
    PlainText = "plain/txt-utf8",
    ProofByToken = "token-proof",
    LinkedObject = "linked-object"
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
    object_value?: string,
    negative: boolean,
    data: object
}

export enum Network {
    ErgoTestnet = "ergo-testnet",
    ErgoMainnet = "ergo",
    BitcoinTestnet = "btc-testnet",
    BitcoinMainnet = "btc"
}

export function compute(proof: ReputationProof, object_type: ObjectType, object_value: string): number
{
    const renderedProofs = new Map<string, ReputationProof>();
		get(proofs).forEach((value, key) => {
			const renderedKey = stringToRendered(key);
			renderedProofs.set(renderedKey, value);
		});
    return internal_compute(
        renderedProofs,
        proof,
        object_type,
        stringToRendered(object_value),
        get(compute_deep_level)
    );
}

function internal_compute(proofs: Map<string, ReputationProof>, proof: ReputationProof, object_type: ObjectType, object_value: string, deep_level: number): number {
    console.log("Compute deep_level ", deep_level, " on ", proof.token_id)
    return proof.current_boxes.reduce((total, box) => {
        const proportion = box.token_amount / proof.total_amount;
        const boxReputation = proportion * computePointerReputation(proofs, box, object_type, object_value, deep_level);
        return total + (box.negative ? -1 : 1) * boxReputation;
    }, 0);
}

function computePointerReputation(proofs: Map<string, ReputationProof>, box: RPBox, object_type: ObjectType, object_value: string, deep_level: number): number {
    switch (box.object_type) {
        case ObjectType.ProofByToken:
            if (object_type === ObjectType.ProofByToken && box.object_value === object_value) {
                return 1.00;
            } else if (box.object_value && proofs.has(box.object_value)) {
                return deep_level <= 0 ? 0.00 : internal_compute(proofs, proofs.get(box.object_value)!, object_type, object_value, deep_level-1);
            } else {
                return 0.00;
            }
        case ObjectType.PlainText:
            return object_type === ObjectType.PlainText && object_value === box.object_value ? 1.00 : 0.00;
        default:
            return 0.00;
    }
}