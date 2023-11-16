import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network } from "@fleet-sdk/core";
import { sha256, hex } from "@fleet-sdk/crypto";

export const explorer_uri = "https://api.ergoplatform.com";

let contract = "{proveDlog(decodePoint(SELF.R7[Coll[Byte]].get)) && OUTPUTS.forall({(x: Box) => x.propositionBytes == SELF.propositionBytes})}";
// let contract = "{proveDlog(CONTEXT.preHeader.minerPk)}"

let ergoTree = compile(contract, {version: 1})

let ertoTreeAddress = ErgoAddress.fromErgoTree(ergoTree.toHex(), Network.Testnet).toString()
let ergoTreeHash = hex.encode(sha256(ergoTree.toBytes()))

export const ergo_tree_hash = ergoTreeHash
export const ergo_tree_address = ertoTreeAddress;