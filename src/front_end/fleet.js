var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TransactionBuilder, OutputBuilder } from "./node_modules/@fleet-sdk/core";
// import * as crypto from 'crypto';
function calculateSHA256(input) {
    /*
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex'); */
    return "";
}
/*
  EIP-12 compatible browser wallets on Ergo will automatically inject the Connection API
  into every active page so that any JavaScript context can interact with it directly through
  the ergoConnector object.
*/
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    let ergoConnector;
    if (ergoConnector) { // check if Connection API is injected
        const nautilus = ergoConnector.nautilus;
        if (nautilus) { // check if Nautilus Wallet is available
            console.log("Nautilus Wallet is ready to use");
            const connected = yield nautilus.connect();
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
    function generate_reputation_proof(new_one, token_id, token_amount) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const unsignedTransaction = new TransactionBuilder(yield ergo.get_current_height())
                .from(ergo.get_utxos()) // add inputs
                .to(builder)
                .sendChangeTo(wallet_pk) // set change address
                .payMinFee() // set fee
                .build() // build!
                .toPlainObject();
            const signedTransaction = yield ergo.sign_tx(unsignedTransaction);
            const transactionId = yield ergo.submit_tx(signedTransaction);
            console.log("transaction id -> ", transactionId);
        });
    }
}));
//# sourceMappingURL=fleet.js.map