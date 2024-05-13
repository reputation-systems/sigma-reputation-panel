import { compile } from "@fleet-sdk/compiler";
import { ErgoAddress, Network } from "@fleet-sdk/core";
import { sha256, hex } from "@fleet-sdk/crypto";

export const explorer_uri = "https://api-testnet.ergoplatform.com";

let contract = `{
  proveDlog(SELF.R7[GroupElement].get) &&
  sigmaProp(SELF.tokens.size == 1) &&
  sigmaProp(OUTPUTS.forall { (x: Box) =>
    !(x.tokens.exists { (token: (Coll[Byte], Long)) => token._1 == SELF.tokens(0)._1 }) ||
    (
      x.R7[GroupElement].get == SELF.R7[GroupElement].get &&
      x.tokens.size == 1 &&
      x.propositionBytes == SELF.propositionBytes &&
      (x.R9[Boolean].get == false || x.R9[Boolean].get == true)
    )
  })
}`;
let ergoTree = compile(contract, {version: 1})

let ergoTreeAddress = ErgoAddress.fromErgoTree(ergoTree.toHex(), Network.Testnet).toString()
let ergoTreeHash = hex.encode(sha256(ergoTree.template.toBytes()))

export const ergo_tree_hash = ergoTreeHash
export const ergo_tree_address = ergoTreeAddress;