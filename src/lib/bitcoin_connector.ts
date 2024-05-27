import { Network, ObjectType, type RPBox, type ReputationProof } from "./ReputationProof";


export async function post_sigma_rune(token_amount: number, input_proof?: RPBox,
    object_to_assign?: string, 
    object_type_to_assign: ObjectType = ObjectType.PlainText,
    negative: boolean = false,
    tags?: string
  ): Promise<string|null> 
  {

    return await ""
  }

export async function post_raw_data(token_amount: number, input_proof?: RPBox,
    object_to_assign?: string, 
    object_type_to_assign: ObjectType = ObjectType.PlainText,
    negative: boolean = false,
    tags?: string
  ): Promise<string|null> 
  {
    
    return await ""
  }

export async function fetch_proofs_over_runes(): Promise<Map<string, ReputationProof>> 
{
  let proofs = new Map<string, ReputationProof>();

  proofs.set("btc-test-proof", {
    current_boxes: [], 
    token_id: "btc-test-proof",
    number_of_boxes: 0,
    total_amount: 100,
    network: Network.Bitcoin,
    format: "sigma-rune",
    can_be_spend: true,
    tag: "only-a-test"
  })

  return await proofs;
}