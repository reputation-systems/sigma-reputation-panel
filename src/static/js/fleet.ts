import { TransactionBuilder, OutputBuilder, Box } from "@fleet-sdk/core";

  /*
    EIP-12 compatible browser wallets on Ergo will automatically inject the Connection API
    into every active page so that any JavaScript context can interact with it directly through
    the ergoConnector object.
  */
const ergoConnector = await ergoConnector;

if (ergoConnector) { // check if Connection API is injected

  const nautilus = ergoConnector.nautilus;
  if (nautilus) { // check if Nautilus Wallet is available
    console.log("Nautilus Wallet is ready to use");

    const connected = await nautilus.connect();

    if (connected) {
      console.log("Connected!");
    } else {
      console.log("Not connected!");
    }

  } else {
    console.log("Nautilus Wallet is not active");
  }

} else {
  console.log("No wallet available");
}


/*
      Once the connection request is accepted by the user, this API will be injected in the same
      way as the Connection API, and you can interact with it through the ergo object.
 */
const ergo = await ergo;

const wallet_pk = ergo.get_change_address();
const unsignedTransaction = new TransactionBuilder(await ergo.get_current_height())
  .from(ergo.get_utxos()) // add inputs
  .to(
    // add outputs
    new OutputBuilder(
      1000000n,
      wallet_pk
    )
  )
  .sendChangeTo(wallet_pk) // set change address
  .payMinFee() // set fee
  .build() // build!
  .toPlainObject();

const signedTransaction = await ergo.sign_tx(unsignedTransaction);