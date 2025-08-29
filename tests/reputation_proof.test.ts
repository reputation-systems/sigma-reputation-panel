import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MockChain } from "@fleet-sdk/mock-chain";
import { compile } from "@fleet-sdk/compiler";
import {
  OutputBuilder,
  SAFE_MIN_BOX_VALUE,
  RECOMMENDED_MIN_FEE_VALUE,
  TransactionBuilder,
  Box,
  Amount,
} from "@fleet-sdk/core";
import { SByte, SColl, SBool, SPair, SLong, SConstant } from "@fleet-sdk/serializer";
import { blake2b256, sha256 } from "@fleet-sdk/crypto";
import * as fs from "fs";
import * as path from "path";
import { stringToBytes } from "@scure/base";
import { hexToBytes } from "$lib/utils";

// --- Auxiliary Serialization Functions (similar to utils.ts) ---

function SString(value: string): string {
    return SColl(SByte, stringToBytes('utf8', value)).toHex();
}

function booleanToSerializer(value: boolean): string {
    return SBool(value).toHex();
}

function tupleToSerialized(isLocked: boolean, totalSupply: number): string {
    return SPair(SBool(isLocked), SLong(BigInt(totalSupply))).toHex();
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

// --- Contract Loading and Compilation ---

const contractsDir = path.resolve(__dirname, "../contracts"); // Make sure the path to your contracts is correct

// Contract for the "Type NFT"
const DIGITAL_PUBLIC_GOOD_SOURCE = fs.readFileSync(path.join(contractsDir, "digital_public_good.es"), "utf-8");
const digitalPublicGoodErgoTree = compile(DIGITAL_PUBLIC_GOOD_SOURCE, { version: 1 });
const digitalPublicGoodScriptHash = uint8ArrayToHex(blake2b256(digitalPublicGoodErgoTree.bytes));

// Main contract for the Reputation Proof
const REPUTATION_PROOF_SOURCE_TEMPLATE = fs.readFileSync(path.join(contractsDir, "reputation_proof.es"), "utf-8");
const REPUTATION_PROOF_SOURCE = REPUTATION_PROOF_SOURCE_TEMPLATE.replace("`+DIGITAL_PUBLIC_GOOD_SCRIPT_HASH+`", digitalPublicGoodScriptHash);
const reputationProofErgoTree = compile(REPUTATION_PROOF_SOURCE, { version: 1 });


describe("Reputation Proof Contract Tests", () => {
  let mockChain: MockChain;
  let creator: ReturnType<MockChain["newParty"]>;
  
  // Contract Parties
  let reputationProofContract: ReturnType<MockChain["addParty"]>;
  let digitalPublicGoodContract: ReturnType<MockChain["addParty"]>;

  // Reusable Boxes and Tokens
  let typeNftBox: Box<Amount>;
  const typeNftId = "01c236e723a189c99e9c9380dc48a6058e888c88e9a107df1c0519d0a5bf838e";

  afterEach(() => {
    mockChain.reset();
  });

  beforeEach(() => {
    mockChain = new MockChain({ height: 800_000 });

    // --- Actors ---
    creator = mockChain.newParty("Creator");
    creator.addBalance({ nanoergs: 10_000_000n }); // 0.01 ERG

    // --- Contract Parties ---
    reputationProofContract = mockChain.addParty(reputationProofErgoTree.toHex(), "ReputationProofContract");
    digitalPublicGoodContract = mockChain.addParty(digitalPublicGoodErgoTree.toHex(), "DigitalPublicGoodContract");

    // --- Creation of the "Type NFT" box (used in dataInputs) ---
    digitalPublicGoodContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: digitalPublicGoodErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: typeNftId, amount: 1n }],
      additionalRegisters: {
        R4: SString("Testable Proof Type"),
        R5: SString("A type for testing purposes."),
        R6: SString("https://schema.org/CreativeWork"),
        R7: booleanToSerializer(true)
      }
    });
    typeNftBox = digitalPublicGoodContract.utxos.toArray()[0];
  });

  it("should create a new reputation proof successfully", () => {
    const currentHeight = mockChain.height;
    const totalSupply = 1000;
    const objectPointer = "https://ergoplatform.org";
    const creatorPkBytes = creator.address.getPublicKeys()[0];

    // --- Definition of the reputation proof Output ---
    const newProofOutput = new OutputBuilder(
      SAFE_MIN_BOX_VALUE,
      reputationProofContract.address
    )
    .mintToken({
        amount: totalSupply.toString(),
        name: "Reputation Proof Token Test",
    })
    .setAdditionalRegisters({
        R4: SString(typeNftId),
        R5: SString(objectPointer),
        R6: tupleToSerialized(false, totalSupply), // isLocked: false
        R7: SColl(SByte, creatorPkBytes),
        R8: booleanToSerializer(true), // polarization: true (positive)
        R9: SString(JSON.stringify({ message: "Initial creation" }))
    });

    // --- Transaction Construction ---
    const tx = new TransactionBuilder(currentHeight)
      .from(creator.utxos)
      .to(newProofOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();
    
    // --- Execution and Verification ---
    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;
    
    expect(reputationProofContract.utxos.length).to.equal(1);
    const createdBox = reputationProofContract.utxos.toArray()[0];
    const mintedTokenId = createdBox.assets[0].tokenId;
    
    expect(mintedTokenId).to.equal(tx.inputs[0].boxId); // The token ID is the ID of the first input box
    expect(createdBox.assets[0].amount).to.equal(BigInt(totalSupply));
    expect(createdBox.additionalRegisters.R4).to.equal(SString(typeNftId));
    expect(createdBox.additionalRegisters.R5).to.equal(SString(objectPointer));
    expect(createdBox.additionalRegisters.R8).to.equal(booleanToSerializer(true));
  });

  it("should update an existing reputation proof by splitting it", () => {
    // --- Initial State: Create a reputation proof to be spent ---
    const initialTotalSupply = 1000;
    const initialObjectPointer = "https://github.com/ergoplatform";
    const creatorPkBytes = creator.address.getPublicKeys()[0];
    const initialProofTokenId = "a".repeat(64); // predictable token ID

    const r7 = SColl(SByte, blake2b256(new Uint8Array([...( new Uint8Array([0x00, 0x08, 0xcd])), ...creatorPkBytes]))).toHex();

    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) }],
      additionalRegisters: {
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R5: SString(initialObjectPointer),
        R6: tupleToSerialized(false, initialTotalSupply),
        R7: r7,
        R8: booleanToSerializer(true),
        R9: SString(JSON.stringify({ comment: "Original comment" }))
      }
    });
    const proofToSpend = reputationProofContract.utxos.toArray()[0];

    // --- Parameters for the update ---
    const updatedAmount = 200;
    const changeAmount = initialTotalSupply - updatedAmount; // 800
    const updatedObjectPointer = "https://google.io";
    const updatedPolarization = false; // Change to negative

    // --- Definition of the Outputs ---
    // 1. The updated box with new data and 200 tokens
    const updatedProofOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, reputationProofContract.address)
      .addTokens([{ tokenId: initialProofTokenId, amount: updatedAmount.toString() }])
      .setAdditionalRegisters({
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R5: SString(updatedObjectPointer),
        R6: tupleToSerialized(false, initialTotalSupply),
        R7: r7,
        R8: booleanToSerializer(updatedPolarization),
        R9: SString(JSON.stringify({ message: "This is an updated proof." }))
      });

    // 2. The "change" box with the remaining 800 tokens and original registers
    const changeProofOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, reputationProofContract.address)
      .addTokens([{ tokenId: initialProofTokenId, amount: changeAmount.toString() }])
      .setAdditionalRegisters(proofToSpend.additionalRegisters);
    
    // --- Transaction Construction ---
    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...creator.utxos.toArray()])
      .to([updatedProofOutput, changeProofOutput])
      .withDataFrom([typeNftBox]) // The "Proof of Completeness" is satisfied because 100% of the supply is in the inputs.
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    // --- Execution and Verification ---
    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;

    expect(reputationProofContract.utxos.length).to.equal(2);

    // Verify the updated box
    const updatedBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === BigInt(updatedAmount));
    expect(updatedBox).to.not.be.undefined;
    expect(updatedBox?.additionalRegisters.R5).to.equal(SString(updatedObjectPointer));
    expect(updatedBox?.additionalRegisters.R8).to.equal(booleanToSerializer(updatedPolarization));

    // Verify the change box
    const changeBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === BigInt(changeAmount));
    expect(changeBox).to.not.be.undefined;
    expect(changeBox?.additionalRegisters.R5).to.equal(SString(initialObjectPointer)); // It must keep the original R5
    expect(changeBox?.additionalRegisters).to.deep.equal(proofToSpend.additionalRegisters);
  })

  it("should fail to update if the transaction is not signed by the owner", () => {
    // --- Initial State: Proof box owned by 'creator' ---
    const initialTotalSupply = 1000;
    const creatorPkBytes = creator.address.getPublicKeys()[0];
    const initialProofTokenId = "b".repeat(64);
    // The creator's public key is saved in R7 for ownership verification
    const r7 = SColl(SByte, blake2b256(new Uint8Array([...( new Uint8Array([0x00, 0x08, 0xcd])), ...creatorPkBytes]))).toHex();

    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) }],
      additionalRegisters: {
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R5: SString("some-pointer"),
        R6: tupleToSerialized(false, initialTotalSupply),
        R7: r7,
        R8: booleanToSerializer(true),
        R9: SString("{}")
      }
    });
    const proofToSpend = reputationProofContract.utxos.toArray()[0];

    // --- An unauthorized actor attempts to update the box ---
    const attacker = mockChain.newParty("Attacker");
    attacker.addBalance({ nanoergs: 10_000_000n });

    const updatedOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, reputationProofContract.address)
      .addTokens([{ tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) }])
      .setAdditionalRegisters({ ...proofToSpend.additionalRegisters, R5: SString("hacked-pointer") });
      
    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...attacker.utxos.toArray()])
      .to(updatedOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(attacker.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    // --- Execution and Verification ---
    // The execution must fail because the 'attacker' is not the owner defined in R7
    const executionResult = mockChain.execute(tx, { signers: [attacker], throw: false });
    expect(executionResult).to.be.false;
    
    // The contract's state should not have changed
    expect(reputationProofContract.utxos.length).to.equal(1);
    expect(reputationProofContract.utxos.toArray()[0].additionalRegisters.R5).to.equal(SString("some-pointer"));
  });

  it("should allow anyone to add ERGs to a proof box (top-up for demurrage)", () => {
    // --- Initial State: Proof box owned by 'creator' ---
    const initialTotalSupply = 1000;
    const creatorPkBytes = creator.address.getPublicKeys()[0];
    const initialProofTokenId = "c".repeat(64);
    const r7 = SColl(SByte, blake2b256(new Uint8Array([...( new Uint8Array([0x00, 0x08, 0xcd])), ...creatorPkBytes]))).toHex();

    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) }],
      additionalRegisters: {
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R5: SString("demurrage-test"),
        R6: tupleToSerialized(false, initialTotalSupply),
        R7: r7,
        R8: booleanToSerializer(true),
        R9: SString("{}")
      }
    });
    const proofToSpend = reputationProofContract.utxos.toArray()[0];
    
    // --- A 'good samaritan' adds ERGs to the box ---
    const goodSamaritan = mockChain.newParty("GoodSamaritan");
    const topUpAmount = 1_000_000n; // 0.001 ERG
    goodSamaritan.addBalance({ nanoergs: topUpAmount + RECOMMENDED_MIN_FEE_VALUE });

    // The output is an exact copy of the input, but with more ERGs
    const toppedUpOutput = new OutputBuilder(proofToSpend.value + topUpAmount, reputationProofContract.address)
      .addTokens(proofToSpend.assets)
      .setAdditionalRegisters(proofToSpend.additionalRegisters);
    
    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...goodSamaritan.utxos.toArray()])
      .to(toppedUpOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(goodSamaritan.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    // --- Execution and Verification ---
    // The execution should succeed, as this action does not require the owner's signature
    const executionResult = mockChain.execute(tx, { signers: [goodSamaritan] });
    expect(executionResult).to.be.true;

    // Verify that the box has been replaced by one with more ERGs
    expect(reputationProofContract.utxos.length).to.equal(1);
    const newBox = reputationProofContract.utxos.toArray()[0];
    expect(newBox.value).to.equal(proofToSpend.value + topUpAmount);
    // The other data must remain identical
    expect(newBox.additionalRegisters).to.deep.equal(proofToSpend.additionalRegisters);
  });

  it("should update multiple proof boxes of the same token in one transaction", () => {
    // --- Initial State: Two boxes of the same proof, both owned by 'creator' ---
    const initialTotalSupply = 1000;
    const creatorPkBytes = creator.address.getPublicKeys()[0];
    const proofTokenId = "d".repeat(64);
    const r7 = SColl(SByte, blake2b256(new Uint8Array([...( new Uint8Array([0x00, 0x08, 0xcd])), ...creatorPkBytes]))).toHex();
    
    const commonRegisters = {
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R6: tupleToSerialized(false, initialTotalSupply),
        R7: r7,
        R9: SString("{}")
    };

    // CORRECTION: Call addUTxOs twice, once for each box.
    reputationProofContract.addUTxOs({ // Box 1
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(), 
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: proofTokenId, amount: 600n }],
      additionalRegisters: { ...commonRegisters, R5: SString("pointer-A"), R8: booleanToSerializer(true) }
    });
    
    reputationProofContract.addUTxOs({ // Box 2
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: proofTokenId, amount: 400n }],
      additionalRegisters: { ...commonRegisters, R5: SString("pointer-B"), R8: booleanToSerializer(true) }
    });

    const [proofToSpend1, proofToSpend2] = reputationProofContract.utxos.toArray();

    // --- Update parameters: we will consolidate and change R5 and R8 ---
    const newPointer = "consolidated-pointer";
    const newPolarization = false;

    // New single output that consolidates the tokens
    const consolidatedOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, reputationProofContract.address)
      .addTokens([{ tokenId: proofTokenId, amount: BigInt(initialTotalSupply) }])
      .setAdditionalRegisters({
        ...commonRegisters,
        R5: SString(newPointer),
        R8: booleanToSerializer(newPolarization)
      });
      
    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend1, proofToSpend2, ...creator.utxos.toArray()])
      .to(consolidatedOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    // --- Execution and Verification ---
    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;

    // Verify that the two old boxes were replaced by a new, consolidated one
    expect(reputationProofContract.utxos.length).to.equal(1);
    const consolidatedBox = reputationProofContract.utxos.toArray()[0];
    expect(consolidatedBox.assets[0].amount).to.equal(BigInt(initialTotalSupply));
    expect(consolidatedBox.additionalRegisters.R5).to.equal(SString(newPointer));
    expect(consolidatedBox.additionalRegisters.R8).to.equal(booleanToSerializer(newPolarization));
  });

});
