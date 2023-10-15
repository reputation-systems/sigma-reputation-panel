import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";
import * as crypto from 'crypto';
function calculateSHA256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}
/*
  EIP-12 compatible browser wallets on Ergo will automatically inject the Connection API
  into every active page so that any JavaScript context can interact with it directly through
  the ergoConnector object.
*/
document.addEventListener("DOMContentLoaded", async () => {
    let ergoConnector;
    if (ergoConnector) { // check if Connection API is injected
        const nautilus = ergoConnector.nautilus;
        if (nautilus) { // check if Nautilus Wallet is available
            console.log("Nautilus Wallet is ready to use");
            const connected = await nautilus.connect();
            if (connected) {
                console.log("Connected!");
            }
            else {
                console.log("Not connected!");
            }
        }
        else {
            console.log("Nautilus Wallet is not active");
        }
    }
    else {
        console.log("No wallet available");
    }
    async function generate_reputation_proof(new_one, token_id, token_amount) {
        /*
              Once the connection request is accepted by the user, this API will be injected in the same
              way as the Connection API, and you can interact with it through the ergo object.
         */
        let ergo;
        const wallet_pk = ergo.get_change_address();
        const token_label = calculateSHA256(wallet_pk + ergo.get_current_height().toString()); // TODO set by user optionally.
        const builder = new OutputBuilder(1000n, wallet_pk);
        if (new_one) {
            // https://fleet-sdk.github.io/docs/transaction-building#step-4-2-mint-a-token
            builder.mintToken({
                amount: token_amount,
                name: "reputation-token-" + token_label,
                decimals: 0,
                description: "Reputation token " + token_label + " of the wallet " + wallet_pk
            });
        }
        else {
            // https://fleet-sdk.github.io/docs/transaction-building#step-4-1-add-tokens
            builder.addTokens({
                tokenId: token_id,
                amount: token_amount
            }, { sum: false });
        }
        // TODO assign the contract.
        const unsignedTransaction = new TransactionBuilder(await ergo.get_current_height())
            .from(ergo.get_utxos()) // add inputs
            .to(builder)
            .sendChangeTo(wallet_pk) // set change address
            .payMinFee() // set fee
            .build() // build!
            .toPlainObject();
        const signedTransaction = await ergo.sign_tx(unsignedTransaction);
        const transactionId = await ergo.submit_tx(signedTransaction);
        console.log("transaction id -> ", transactionId);
    }
});
//# sourceMappingURL=fleet.js.map