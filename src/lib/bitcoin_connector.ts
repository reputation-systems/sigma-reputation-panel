import axios from "axios";
import { Network, ObjectType, type RPBox, type ReputationProof } from "./ReputationProof";
import { stringToSerialized } from "./utils";
import { ergo_tree_hash } from "./envs";
import { sigma_runes_service } from "./store";
import { get } from "svelte/store";


interface Token {
  id: string;
  amount: number;
}

interface Box {
  sigma_script: string;
  tokens: Token[];
  r4?: string;
  r5?: string;
  r6?: string;
  r7?: string;
  r8?: string;
  r9?: string;
}

/*
function calculateSHA256(input: string): string {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}*/

async function addBox(box: Box): Promise<null> {
  try {
    const response = await axios.post(get(sigma_runes_service)+'/add/', box);
    console.log('Box added successfully:', response.data);
  } catch (error) {
    console.error('Error adding box:', error);
  }
  return null
}

export async function post_sigma_rune(token_amount: number, input_proof?: RPBox,
  object_to_assign?: string, 
  object_type_to_assign: ObjectType = ObjectType.PlainText,
  negative: boolean = false,
  tags?: string
): Promise<string|null> 
{
  const formatted_tags = tags !== undefined ? tags.toLowerCase().replace(/\s+/g, '-') : null;
  const reputation_token_label = formatted_tags ?? "reputation-proof-token";   

  const concatenatedString = `${reputation_token_label},${object_type_to_assign?? ""},${object_to_assign ?? ""}`;
  const token_id = concatenatedString;

  return await addBox({
    sigma_script: ergo_tree_hash,
    tokens: [{
      "id": token_id,
      "amount": token_amount
    }],
    r4: stringToSerialized(reputation_token_label),
    r5: stringToSerialized(object_type_to_assign),
    r6: stringToSerialized(object_to_assign ?? ""),
    r7: "",
    r8: "",
    r9: ""
  });
}

export async function post_raw_data(token_amount: number, input_proof?: RPBox,
    object_to_assign?: string, 
    object_type_to_assign: ObjectType = ObjectType.PlainText,
    negative: boolean = false,
    tags?: string
  ): Promise<string|null> 
  {
    
    // Needs another service? (ord-service/bitcoin-raw-data-service)
    return await ""
  }

export async function fetch_proofs_over_runes(): Promise<Map<string, ReputationProof>> {
  try {
    const response = await axios.get(get(sigma_runes_service) + '/fetch/');
    const proofsData: Box[] = response.data;

    let proofs = new Map<string, ReputationProof>();

    // Parse the response data and populate the proofs map
    for (const proofData of proofsData) {
      proofs.set(proofData.tokens[0]['id'], {
        current_boxes: [],
        token_id: proofData.tokens[0]['id'],
        number_of_boxes: 1,
        total_amount: proofData.tokens[0]['amount'],
        network: Network.Bitcoin,
        format: "sigma-rune",
        can_be_spend: false,
        tag: proofData.r4 ?? ""
      });
    }

    return proofs;
  } catch (error) {
    console.error('Error fetching proofs over runes:', error);
    return new Map<string, ReputationProof>();
  }
}