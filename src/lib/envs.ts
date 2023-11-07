import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network } from "@fleet-sdk/core";

export const explorer_uri = "https://api.ergoplatform.com";

// let contract = "{proveDlog(decodePoint(SELF.getReg(7).get)) && sigmaProp(OUTPUTS.forall(v1 => v1.propBytes == SELF.propBytes))}";

let contract = "{proveDlog(CONTEXT.preHeader.minerPk)}"
let ergoTree = compile(contract, {version: 1}).toHex()
let ertoTreeAddress = ErgoAddress.fromErgoTree(ergoTree, Network.Testnet).toString()
let ergoTreeHash = "E5F0CD9A2DD463FF71EA56A2F4E94E442DFFCB630E79B08C20E840540D136CC3"  // sha256(compile(contract).toHex()).hexdigest()

export const ergo_tree_hash = ergoTreeHash
export const ergo_tree = ergoTree;