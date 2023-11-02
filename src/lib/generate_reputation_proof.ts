import {
    OutputBuilder,
    SAFE_MIN_BOX_VALUE,
    RECOMMENDED_MIN_FEE_VALUE,
    TransactionBuilder,
} from '@fleet-sdk/core';

import type { ReputationProof } from '$lib/ReputationProof';

export async function generate_reputation_proof(token_amount: string, input_proof?: ReputationProof) {
    /*
          Once the connection request is accepted by the user, this API will be injected in the same
          way as the Connection API, and you can interact with it through the ergo object.
     */
    let token_id =  input_proof ? input_proof.token_id : "--";
    let inputs = input_proof ? [input_proof.box] : await ergo.get_utxos();

    console.log("new one ", input_proof, " \n  token id ", token_id, "   token_amount", token_amount, " \n inputs ", inputs)

    const wallet_pk = await ergo.get_change_address();

    const token_label: string = wallet_pk + ergo.get_current_height().toString();
    const builder = new OutputBuilder(
      SAFE_MIN_BOX_VALUE,
      wallet_pk
    );

    if (input_proof) {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-2-mint-a-token
      builder.mintToken({
        amount: token_amount, // the amount of tokens being minted without decimals
        name: "rt-" + token_label, // the name of the token
        decimals: 0, // the number of decimals
        description: "Reputation token "  + token_label + " of the wallet " + wallet_pk
      })
    } else {
      // https://fleet-sdk.github.io/docs/transaction-building#step-4-1-add-tokens
      builder.addTokens({
        tokenId: token_id,
        amount: token_amount
      }, {sum: false})
    }

    // TODO assign the contract.
    const unsignedTransaction = await new TransactionBuilder(await ergo.get_current_height())
      .from(inputs) // add inputs
      .to(builder)
      .sendChangeTo(wallet_pk) // set change address
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build() // build!
      .toEIP12Object();

    console.log(unsignedTransaction)

    const signedTransaction = await ergo.sign_tx(unsignedTransaction);
    const transactionId = await ergo.submit_tx(signedTransaction);
    console.log("transaction id -> ", transactionId)
}