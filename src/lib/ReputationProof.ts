import type { Amount, type Box } from "@fleet-sdk/core";
import { get } from 'svelte/store';
import { proofs, compute_deep_level } from "./store";

// --- CORE TYPES ---

/**
 * Describes the metadata extracted from a "Type NFT".
 * This metadata defines the standard for a class of reputation proofs.
 */
export interface TypeNftMetadata {
    name: string;
    description: string;
    schemaURI: string;
    version: string;
}

/**
 * Represents a complete set of reputation proofs associated with a token.
 * The "type" information now comes from the Type NFT's metadata.
 */
export interface ReputationProof {
    token_id: string;
    type_nft_id: string;          // ID of the Type NFT that defines this proof (from R4)
    type_metadata: TypeNftMetadata; // Cached metadata from the Type NFT
    total_amount: number;         // Total supply of tokens in this set (from R6)
    owner_address: string;        // Owner's address (from R7)
    can_be_spend: boolean;
    current_boxes: RPBox[];
    number_of_boxes: number;
    network: Network;
    data: object;                 // General data for the proof
}

/**
 * Represents a single box holding a portion of the reputation tokens.
 */
export interface RPBox {
    box: Box<Amount>;
    box_id: string;
    token_id: string;
    token_amount: number;
    object_pointer: string;       // The object this proof points to (from R5)
    is_locked: boolean;           // The lock state of this box (from R6)
    polarization: boolean;        // true for positive, false for negative (from R8)
    content: object;              // Specific content of this box (from R9)
}

// --- ENUMS & UTILITIES ---

export enum Network {
    ErgoTestnet = "ergo-testnet",
    ErgoMainnet = "ergo",
    BitcoinTestnet = "btc-testnet",
    BitcoinMainnet = "btc"
}

// --- REPUTATION COMPUTATION LOGIC ---

/**
 * Computes the aggregate reputation score that a `ReputationProof` gives to a specific object.
 * @param proof The reputation proof to evaluate.
 * @param target_object_pointer The object (e.g., a URL, a token ID) for which reputation is being calculated.
 * @returns A numeric score representing the reputation.
 */
export function compute(proof: ReputationProof, target_object_pointer: string): number {
    const all_proofs = get(proofs);
    return internal_compute(
        all_proofs,
        proof,
        target_object_pointer,
        get(compute_deep_level)
    );
}

/**
 * Internal recursive function for reputation calculation.
 */
function internal_compute(
    all_proofs: Map<string, ReputationProof>,
    proof: ReputationProof,
    target_object_pointer: string,
    deep_level: number
): number {
    console.log(`Compute (deep_level: ${deep_level}) on proof: ${proof.type_metadata.name} (${proof.token_id})`);
    
    return proof.current_boxes.reduce((total, box) => {
        const proportion = box.token_amount / proof.total_amount;
        const boxReputation = computeBoxReputation(all_proofs, proof, box, target_object_pointer, deep_level);
        
        // Apply polarization: +1 for positive, -1 for negative.
        const signedReputation = (box.polarization ? 1 : -1) * boxReputation;
        
        return total + (proportion * signedReputation);
    }, 0);
}

/**
 * Computes the reputation of a single box (RPBox).
 * It determines if the box points directly to the target or if it's a recursive pointer to another proof.
 */
function computeBoxReputation(
    all_proofs: Map<string, ReputationProof>,
    parent_proof: ReputationProof,
    box: RPBox,
    target_object_pointer: string,
    deep_level: number
): number {
    
    // Decide how to interpret the `object_pointer` based on the proof's type name.
    // This assumes a convention for naming recursive proof types.
    if (parent_proof.type_metadata.name.includes("Proof-by-Token")) {
        const pointed_token_id = box.object_pointer;

        if (pointed_token_id === parent_proof.token_id) return 0.00; // Prevent self-recursion loop

        const pointed_proof = all_proofs.get(pointed_token_id);
        if (pointed_proof) {
            if (deep_level <= 0) return 0.00; // Stop if max recursion depth is reached
            return internal_compute(all_proofs, pointed_proof, target_object_pointer, deep_level - 1);
        } else {
            return 0.00; // Pointed-to proof not found
        }
    } else {
        // This is a direct proof (e.g., "Website Review").
        // Its reputation is 1.0 if its pointer matches the target, and 0.0 otherwise.
        return box.object_pointer === target_object_pointer ? 1.00 : 0.00;
    }
}