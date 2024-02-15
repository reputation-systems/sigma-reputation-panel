import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network } from "@fleet-sdk/core";
import { sha256, hex } from "@fleet-sdk/crypto";

export const explorer_uri = "https://api-testnet.ergoplatform.com";

let contract = "{proveDlog(decodePoint(SELF.R7[Coll[Byte]].get)) && sigmaProp(OUTPUTS.forall({(box1: Box) => box1.propositionBytes == SELF.propositionBytes }))}";
let ergoTree = compile(contract, {version: 1})

let ergoTreeAddress = ErgoAddress.fromErgoTree(ergoTree.toHex(), Network.Testnet).toString()
let ergoTreeHash = hex.encode(sha256(ergoTree.template.toBytes()))

export const ergo_tree_hash = ergoTreeHash
export const ergo_tree_address = ergoTreeAddress;