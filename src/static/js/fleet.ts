import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";

type Box = {
  boxId: string;
  value: string | bigint;
  assets: { tokenId: string; amount: string | bigint }[];
  ergoTree: string;
  creationHeight: number;
  additionalRegisters: "asdf";
  index: number;
  transactionId: "fdajfhadjh";
};

const unsignedTransaction = new TransactionBuilder(123)
  .from(Box) // add inputs
  .to(
    // add outputs
    new OutputBuilder(
      1000000n,
      "9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j"
    )
  )
  .sendChangeTo("9gNvAv97W71Wm33GoXgSQBFJxinFubKvE6wh2dEhFTSgYEe783j") // set change address
  .payMinFee() // set fee
  .build(); // build!