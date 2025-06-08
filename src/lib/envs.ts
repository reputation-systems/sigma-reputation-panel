import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network } from "@fleet-sdk/core";
import { sha256, hex } from "@fleet-sdk/crypto";

export const explorer_uri = "https://api.ergoplatform.com";

// The full, correct ErgoScript for the Reputation Proof contract.
// This contract validates proofs against a "Type NFT" standard.
const contract = ``;

import REPUTATION_PROOF from '../../contracts/reputation_proof.es?raw';

// Compile the contract to get the ErgoTree
const ergoTree = compile(REPUTATION_PROOF, { version: 1 });

// Derive the P2S address and the template hash from the ErgoTree
const ergoTreeAddress = ErgoAddress.fromErgoTree(ergoTree.toHex(), Network.Mainnet).toString();
const ergoTreeHash = hex.encode(sha256(ergoTree.template.toBytes()));

export const ergo_tree_hash = ergoTreeHash;
export const ergo_tree_address = ergoTreeAddress;

export const proof_by_token_type_nft_id = "";