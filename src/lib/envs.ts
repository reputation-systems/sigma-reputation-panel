import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network } from "@fleet-sdk/core";
import { sha256, hex } from "@fleet-sdk/crypto";

export const explorer_uri = "https://api-testnet.ergoplatform.com";

let contract = `{
    proveDlog(SELF.R7[GroupElement].get) &&
    sigmaProp(OUTPUTS.exists({(x: Box) => x.propositionBytes == SELF.propositionBytes}))
}`;
let ergoTree = compile(contract, {version: 1})

let ergoTreeAddress = ErgoAddress.fromErgoTree(ergoTree.toHex(), Network.Testnet).toString()
let ergoTreeHash = hex.encode(sha256(ergoTree.template.toBytes()))

export const ergo_tree_hash = ergoTreeHash
export const ergo_tree_address = ergoTreeAddress;