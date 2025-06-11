import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network } from "@fleet-sdk/core";
import { sha256, hex } from "@fleet-sdk/crypto";

// --- Explorer Configuration ---
export const explorer_uri = "https://api.ergoplatform.com";
export const min_erg_value = "1000000"; // 0.001 ERG

// --- Contract 1: Reputation Proof ---
// This is the main contract for creating comments, replies, etc.
import REPUTATION_PROOF_SCRIPT from '../../contracts/reputation_proof.es?raw';

// Compile the Reputation Proof contract
const reputationProofErgoTree = compile(REPUTATION_PROOF_SCRIPT, { version: 1 });

// Derive the P2S address and the template hash
const reputationProofAddress = ErgoAddress.fromErgoTree(reputationProofErgoTree.toHex(), Network.Mainnet).toString();
const reputationProofHash = hex.encode(sha256(reputationProofErgoTree.template.toBytes()));

// Export constants for the Reputation Proof contract
export const ergo_tree_address = reputationProofAddress;
export const ergo_tree_hash = reputationProofHash;


// --- Contract 2: Digital Public Good (for Type NFTs) ---
// This contract protects the Type NFT boxes, making them immutable public records.
import DIGITAL_PUBLIC_GOOD_SCRIPT from '../../contracts/digital_public_good.es?raw';

// Compile the Digital Public Good contract
const digitalPublicGoodErgoTree = compile(DIGITAL_PUBLIC_GOOD_SCRIPT, { version: 1 });
const digitalPublicGoodErgoTreeHex = digitalPublicGoodErgoTree.toHex();
const digitalPublicGoodHash = hex.encode(sha256(digitalPublicGoodErgoTree.template.toBytes()));

// Export the constant for the Type NFT contract
export const digital_public_good_ergo_tree = digitalPublicGoodErgoTreeHex;
export const digital_public_good_contract_hash = digitalPublicGoodHash;
