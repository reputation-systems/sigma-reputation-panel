import {
    OutputBuilder,
    SAFE_MIN_BOX_VALUE,
    RECOMMENDED_MIN_FEE_VALUE,
    TransactionBuilder,
    SConstant,
    SColl,
    SByte
} from '@fleet-sdk/core';
import { stringToBytes } from '@scure/base';
import { ergo_tree_address } from '$lib/envs';

// import { SConstant, SColl, SByte } from '@fleet-sdk/serializer';

import type { ReputationProof } from '$lib/ReputationProof';

export async function generate_reputation_proof(token_amount: number, input_proof?: ReputationProof, object_to_assign?: string) {

    /*
          Once the user accepts the connection request, this API will be injected in the same
          way as the Connection API, and you can interact with it through the ergo object.
     */
    const wallet_pk = await ergo.get_change_address();
    const inputs = await ergo.get_utxos();

    // Output builder
    const builder = new OutputBuilder(
      SAFE_MIN_BOX_VALUE,
      wallet_pk
    );

    if (input_proof === undefined || input_proof === null) {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-2-mint-a-token
      builder.mintToken({
        amount: token_amount.toString(), // the amount of tokens being minted without decimals
      });
    } else {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-1-add-tokens
      builder.addTokens({
        tokenId: input_proof.token_id,
        amount: token_amount.toString()
      }, {sum: false})
    }

    let registers = {
      R4: SConstant(SColl(SByte, stringToBytes('utf8', "RPT"))),
      R5: SConstant(SColl(SByte, stringToBytes('utf8', ''))),
      R6: SConstant(SColl(SByte, stringToBytes('utf8', '0'))),
    }

    if (object_to_assign !== undefined)  
    { 
      /**
       * 
       * https://github.com/ergoplatform/eips/blob/master/eip-0004.md#ergo-asset-types
       *  If there is an object to assign the reputation, there are various ways to support it.
       *  Maybe should improve new ones
       *
      */
      registers = {...registers, ...{
        R5: SConstant(SColl(SByte, stringToBytes('utf8', 'plain/txt-utf8'))),
        R6: SConstant(SColl(SByte, stringToBytes('utf8', object_to_assign))),
      }}
    }

    builder.setAdditionalRegisters({...registers, ...{R7: SConstant(SColl(SByte, stringToBytes('utf8', wallet_pk)))}})

    // TODO assign the contract.
    try {
      console.log(inputs)
      console.log(wallet_pk)
      console.log(ergo_tree_address)

      const unsignedTransaction = await new TransactionBuilder(await ergo.get_current_height())
      .from(inputs)
      .to(builder)
      .sendChangeTo(wallet_pk)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build()
      .toEIP12Object();
  
      const signedTransaction = await ergo.sign_tx(unsignedTransaction);
      const transactionId = await ergo.submit_tx(signedTransaction);
      console.log("Transaction id -> ", transactionId)
      alert("Transaction id -> " + transactionId)
    } catch(error) {
      alert("Transaction error: "+error)
    }
}