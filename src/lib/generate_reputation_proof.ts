import {
    OutputBuilder,
    SAFE_MIN_BOX_VALUE,
    RECOMMENDED_MIN_FEE_VALUE,
    TransactionBuilder} from '@fleet-sdk/core';

// import { SConstant, SColl, SByte } from '@fleet-sdk/serializer';

import { ObjectType, type RPBox } from '$lib/ReputationProof';
import { ergo_tree_address } from './envs';
import { generate_pk_proposition, stringToSerialized } from './utils';

export async function generate_reputation_proof(token_amount: number, input_proof?: RPBox,
                                                object_to_assign?: string, 
                                                object_type_to_assign: ObjectType = ObjectType.PlainText,
                                                tags?: string
                                              ): Promise<string|null>
{

    /*
          Once the user accepts the connection request, this API will be injected in the same
          way as the Connection API, and you can interact with it through the ergo object.
     */
    const wallet_pk = await ergo.get_change_address();
    const inputs = input_proof ?  [...(await ergo.get_utxos()), input_proof?.box] : await ergo.get_utxos();
    let outputs: OutputBuilder[] = [];

    const formatted_tags = tags !== undefined ? tags.toLowerCase().replace(/\s+/g, '-') : null;
    const reputation_token_label = formatted_tags ?? "reputation-proof-token";    

    // Output builder
    const new_proof_output = new OutputBuilder(
      SAFE_MIN_BOX_VALUE,
      ergo_tree_address
    );

    if (input_proof === undefined || input_proof === null) {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-2-mint-a-token
      new_proof_output.mintToken({
        amount: token_amount.toString(), // the amount of tokens being minted without decimals
      });
    } else {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-1-add-tokens
      new_proof_output.addTokens({
        tokenId: input_proof.token_id,
        amount: token_amount.toString()
      }, {sum: false})

      // Replicate the input to a new output. (If it's not added, the rest of the token amount will be send to the wallet address, that is, new output with wallet script)
      if (input_proof.token_amount - token_amount > 0) {
        outputs.push(
          new OutputBuilder(
            SAFE_MIN_BOX_VALUE,
            ergo_tree_address
          )
          .addTokens({
            tokenId: input_proof.token_id,
            amount: (input_proof.token_amount - token_amount).toString()
          }, {sum: false})
          .setAdditionalRegisters(input_proof.box.additionalRegisters)
        )
      }
    }

    /**
       * 
       * https://github.com/ergoplatform/eips/blob/master/eip-0004.md#ergo-asset-types
       *  If there is an object to assign the reputation, there are various ways to support it.
       *  Maybe should improve new ones
       *
      */
    let r5 = "";
    let r6 = "";
    if (object_to_assign !== undefined)
    { 
      r5 = object_type_to_assign;
      r6 = object_to_assign;
    }

    let registers = {
      R4: stringToSerialized(reputation_token_label),
      R5: stringToSerialized(r5),
      R6: stringToSerialized(r6)
    }

    new_proof_output.setAdditionalRegisters({...registers, ...{
      R7: generate_pk_proposition((await ergo.get_change_address()))}
    })

    outputs.push(new_proof_output)

    const unsignedTransaction = await new TransactionBuilder(await ergo.get_current_height())
    .from(inputs)
    .to(outputs)
    .sendChangeTo(wallet_pk)
    .payFee(RECOMMENDED_MIN_FEE_VALUE)
    .build()
    .toEIP12Object();

    const signedTransaction = await ergo.sign_tx(unsignedTransaction);
    const transactionId = await ergo.submit_tx(signedTransaction);

    console.log("Transaction id -> ", transactionId)
    return transactionId;
}