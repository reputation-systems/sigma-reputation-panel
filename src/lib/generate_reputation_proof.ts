import {
    OutputBuilder,
    SAFE_MIN_BOX_VALUE,
    RECOMMENDED_MIN_FEE_VALUE,
    TransactionBuilder,
    SConstant,
    SColl,
    SByte,
} from '@fleet-sdk/core';
import { stringToBytes } from '@scure/base';
import { calculateSHA256 } from '$lib/sha256';

// import { SConstant, SColl, SByte } from '@fleet-sdk/serializer';

import type { ReputationProof } from '$lib/ReputationProof';

export async function generate_reputation_proof(token_amount: string, input_proof?: ReputationProof, object_to_assign?: string): Promise<string> {
    /*
          Once the connection request is accepted by the user, this API will be injected in the same
          way as the Connection API, and you can interact with it through the ergo object.
     */
    let token_id =  input_proof?.token_id ?? "--";
    let inputs = (input_proof !== undefined) ? [input_proof.box] : await ergo.get_utxos();

    const wallet_pk = await ergo.get_change_address();
    const token_label: string = wallet_pk + ergo.get_current_height().toString();

    console.log("new one ", input_proof, " \n  token id ", token_id, "   token_amount", token_amount, 
      " \n inputs ", inputs, " \n object to assign ", object_to_assign,
      "\n wallet public key -> ", wallet_pk, "\n token label -> ", token_label
    )


    // Output builder
    const builder = new OutputBuilder(
      SAFE_MIN_BOX_VALUE,
      wallet_pk
    );

    let name = "rt-" + token_label // the name of the token   // TODO Maybe if we use a common name (like reputation-proof) appear like the same on the Nautilus wallet ?
    let description = "Reputation token "  + token_label + " of the wallet " + wallet_pk

    if (input_proof === undefined) {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-2-mint-a-token
      builder.mintToken({
        amount: token_amount, // the amount of tokens being minted without decimals
      });
    } else {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-1-add-tokens
      builder.addTokens({
        tokenId: token_id,
        amount: token_amount
      }, {sum: false})
    }

    let registers = {
      R4: SConstant(SColl(SByte, stringToBytes('utf8', name))),
      R5: SConstant(SColl(SByte, stringToBytes('utf8', description))),
      R6: SConstant(SColl(SByte, stringToBytes('utf8', '0'))),
    }

    // TODO How the contract knows the owner pk ??

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
        R7: SConstant(SColl(SByte, stringToBytes('utf8', 'nft-reputation-proof'))),  // NFT Asset type.  // TODO if a common constant R4 is used, there is not needed.
        R8: SConstant(SColl(SByte, stringToBytes('utf8', object_to_assign)))   // Todo Object to assign reputation.
      }}
    }

    builder.setAdditionalRegisters(registers)

    // TODO assign the contract.
    const unsignedTransaction = await new TransactionBuilder(await ergo.get_current_height())
      .from(inputs) // add inputs
      .to(builder)
      .sendChangeTo(wallet_pk) // set change address
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build() // build!
      .toEIP12Object();

    const signedTransaction = await ergo.sign_tx(unsignedTransaction);
    const transactionId = await ergo.submit_tx(signedTransaction);
    console.log("transaction id -> ", transactionId)
    return transactionId;
}