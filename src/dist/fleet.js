"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@fleet-sdk/core");
const unsignedTransaction = new core_1.TransactionBuilder(123)
    .from(Box) // add inputs
    .to(
// add outputs
new core_1.OutputBuilder(1000000n, "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"))
    .sendChangeTo("9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j") // set change address
    .payMinFee() // set fee
    .build(); // build!
