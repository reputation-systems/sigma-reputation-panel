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
  Party,
} from "@fleet-sdk/core";
import { SByte, SColl, SBool, SPair, SLong } from "@fleet-sdk/serializer";
import { blake2b256 } from "@fleet-sdk/crypto";
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

const contractsDir = path.resolve(__dirname, "../contracts");

const DIGITAL_PUBLIC_GOOD_SOURCE = fs.readFileSync(path.join(contractsDir, "digital_public_good.es"), "utf-8");
const digitalPublicGoodErgoTree = compile(DIGITAL_PUBLIC_GOOD_SOURCE, { version: 1 });
const digitalPublicGoodScriptHash = uint8ArrayToHex(blake2b256(digitalPublicGoodErgoTree.bytes));

const REPUTATION_PROOF_SOURCE_TEMPLATE = fs.readFileSync(path.join(contractsDir, "reputation_proof.es"), "utf-8");
const REPUTATION_PROOF_SOURCE = REPUTATION_PROOF_SOURCE_TEMPLATE.replace("`+DIGITAL_PUBLIC_GOOD_SCRIPT_HASH+`", digitalPublicGoodScriptHash);
const reputationProofErgoTree = compile(REPUTATION_PROOF_SOURCE, { version: 1 });

describe("Reputation Proof Contract Tests", () => {
  let mockChain: MockChain;
  let creator: Party;
  
  let reputationProofContract: Party;
  let digitalPublicGoodContract: Party;

  let typeNftBox: Box<Amount>;
  const typeNftId = "01c236e723a189c99e9c9380dc48a6058e888c88e9a107df1c0519d0a5bf838e";

  // Generate unique 64-char hex token IDs to avoid encoding issues
  function generateTokenId(seed: string): string {
    const hash = blake2b256(stringToBytes('utf8', seed));
    return uint8ArrayToHex(hash);
  }

  function getCorrectR7(party: Party): string {
    const ergoTreeBytes = hexToBytes(party.address.ergoTree);
    if (!ergoTreeBytes) throw new Error("Could not get ergoTree bytes");
    const hashedProposition = blake2b256(ergoTreeBytes);
    return SColl(SByte, hashedProposition).toHex();
  }

  afterEach(() => {
    mockChain.reset();
  });

  beforeEach(() => {
    mockChain = new MockChain({ height: 800_000 });

    creator = mockChain.newParty("Creator");
    creator.addBalance({ nanoergs: 10_000_000n });

    reputationProofContract = mockChain.addParty(reputationProofErgoTree.toHex(), "ReputationProofContract");
    digitalPublicGoodContract = mockChain.addParty(digitalPublicGoodErgoTree.toHex(), "DigitalPublicGoodContract");

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

    const newProofOutput = new OutputBuilder(
      SAFE_MIN_BOX_VALUE,
      reputationProofContract.address
    )
    .mintToken({
        amount: totalSupply.toString(),
        name: "Reputation Proof Token Test",
    })
    .setAdditionalRegisters({
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R5: SString(objectPointer),
        R6: tupleToSerialized(false, totalSupply),
        R7: getCorrectR7(creator),
        R8: booleanToSerializer(true),
        R9: SString(JSON.stringify({ message: "Initial creation" }))
    });

    const tx = new TransactionBuilder(currentHeight)
      .from(creator.utxos)
      .to(newProofOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();
    
    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;
    
    expect(reputationProofContract.utxos.length).to.equal(1);
    const createdBox = reputationProofContract.utxos.toArray()[0];
    const mintedTokenId = createdBox.assets[0].tokenId;
    
    expect(mintedTokenId).to.equal(tx.inputs[0].boxId);
    expect(createdBox.assets[0].amount).to.equal(BigInt(totalSupply));
    expect(createdBox.additionalRegisters.R4).to.equal(SColl(SByte, hexToBytes(typeNftId) ?? "").toHex());
    expect(createdBox.additionalRegisters.R5).to.equal(SString(objectPointer));
    expect(createdBox.additionalRegisters.R8).to.equal(booleanToSerializer(true));
  });

  it("should update an existing reputation proof by splitting it", () => {
    const initialTotalSupply = 1000;
    const initialObjectPointer = "https://github.com/ergoplatform";
    const initialProofTokenId = generateTokenId("proof-a");

    const r7 = getCorrectR7(creator);

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

    const updatedAmount = 200;
    const changeAmount = initialTotalSupply - updatedAmount;
    const updatedObjectPointer = "https://google.io";
    const updatedPolarization = false;

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

    const changeProofOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, reputationProofContract.address)
      .addTokens([{ tokenId: initialProofTokenId, amount: changeAmount.toString() }])
      .setAdditionalRegisters(proofToSpend.additionalRegisters);
    
    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...creator.utxos.toArray()])
      .to([updatedProofOutput, changeProofOutput])
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;

    expect(reputationProofContract.utxos.length).to.equal(2);

    const updatedBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === BigInt(updatedAmount));
    expect(updatedBox).to.not.be.undefined;
    expect(updatedBox?.additionalRegisters.R5).to.equal(SString(updatedObjectPointer));
    expect(updatedBox?.additionalRegisters.R8).to.equal(booleanToSerializer(updatedPolarization));

    const changeBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === BigInt(changeAmount));
    expect(changeBox).to.not.be.undefined;
    expect(changeBox?.additionalRegisters.R5).to.equal(SString(initialObjectPointer));
    expect(changeBox?.additionalRegisters).to.deep.equal(proofToSpend.additionalRegisters);
  });

  it("should fail to update if the transaction is not signed by the owner", () => {
    const initialTotalSupply = 1000;
    const initialProofTokenId = generateTokenId("proof-b");
    
    const r7 = getCorrectR7(creator);

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

    const executionResult = mockChain.execute(tx, { signers: [attacker], throw: false });
    expect(executionResult).to.be.false;
    
    expect(reputationProofContract.utxos.length).to.equal(1);
    expect(reputationProofContract.utxos.toArray()[0].additionalRegisters.R5).to.equal(SString("some-pointer"));
  });

  it("should allow anyone to add ERGs to a proof box (top-up for demurrage)", () => {
    const initialTotalSupply = 1000;
    const initialProofTokenId = generateTokenId("proof-c");

    const r7 = getCorrectR7(creator); 

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
    
    const goodSamaritan = mockChain.newParty("GoodSamaritan");
    const topUpAmount = 1_000_000n;
    goodSamaritan.addBalance({ nanoergs: topUpAmount + RECOMMENDED_MIN_FEE_VALUE });

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

    const executionResult = mockChain.execute(tx, { signers: [goodSamaritan] });
    expect(executionResult).to.be.true;

    expect(reputationProofContract.utxos.length).to.equal(1);
    const newBox = reputationProofContract.utxos.toArray()[0];
    expect(newBox.value).to.equal(proofToSpend.value + topUpAmount);
    expect(newBox.additionalRegisters).to.deep.equal(proofToSpend.additionalRegisters);
  });

  it("should update multiple proof boxes of the same token in one transaction", () => {
    const initialTotalSupply = 1000;
    const proofTokenId = generateTokenId("proof-d");
    
    const r7 = getCorrectR7(creator); 
    
    const commonRegisters = {
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R6: tupleToSerialized(false, initialTotalSupply),
        R7: r7,
        R9: SString("{}")
    };

    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(), 
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: proofTokenId, amount: 600n }],
      additionalRegisters: { ...commonRegisters, R5: SString("pointer-A"), R8: booleanToSerializer(true) }
    });
    
    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [{ tokenId: proofTokenId, amount: 400n }],
      additionalRegisters: { ...commonRegisters, R5: SString("pointer-B"), R8: booleanToSerializer(true) }
    });

    const [proofToSpend1, proofToSpend2] = reputationProofContract.utxos.toArray();

    const newPointer = "consolidated-pointer";
    const newPolarization = false;

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

    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;

    expect(reputationProofContract.utxos.length).to.equal(1);
    const consolidatedBox = reputationProofContract.utxos.toArray()[0];
    expect(consolidatedBox.assets[0].amount).to.equal(BigInt(initialTotalSupply));
    expect(consolidatedBox.additionalRegisters.R5).to.equal(SString(newPointer));
    expect(consolidatedBox.additionalRegisters.R8).to.equal(booleanToSerializer(newPolarization));
  });

  it("should fail if creator tries to withdraw secondary tokens to their own address", () => {
    const initialTotalSupply = 1000;
    const initialProofTokenId = generateTokenId("proof-e");
    const secondaryTokenId = generateTokenId("secondary-e");
    const secondaryTokenAmount = 500n;
    
    const r7 = getCorrectR7(creator);

    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [
        { tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) },
        { tokenId: secondaryTokenId, amount: secondaryTokenAmount }
      ],
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

    const withdrawOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, creator.address)
      .addTokens([
        { tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) },
        { tokenId: secondaryTokenId, amount: secondaryTokenAmount }
      ])
      .setAdditionalRegisters(proofToSpend.additionalRegisters);

    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...creator.utxos.toArray()])
      .to(withdrawOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    const executionResult = mockChain.execute(tx, { signers: [creator], throw: false });
    expect(executionResult).to.be.false;
    
    expect(reputationProofContract.utxos.length).to.equal(1);
    expect(reputationProofContract.utxos.toArray()[0].assets).to.deep.equal([
      { tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) },
      { tokenId: secondaryTokenId, amount: secondaryTokenAmount }
    ]);
    expect(reputationProofContract.utxos.toArray()[0].additionalRegisters.R5).to.equal(SString("some-pointer"));
  });

  it("should fail if creator tries to reduce the number of secondary tokens", () => {
    const initialTotalSupply = 1000;
    const initialProofTokenId = generateTokenId("proof-f");
    const secondaryTokenId = generateTokenId("secondary-f");
    const secondaryTokenAmount = 500n;
    
    const r7 = getCorrectR7(creator);

    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: SAFE_MIN_BOX_VALUE,
      assets: [
        { tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) },
        { tokenId: secondaryTokenId, amount: secondaryTokenAmount }
      ],
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

    const reducedSecondaryAmount = 300n;
    const reducedOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, reputationProofContract.address)
      .addTokens([
        { tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) },
        { tokenId: secondaryTokenId, amount: reducedSecondaryAmount }
      ])
      .setAdditionalRegisters(proofToSpend.additionalRegisters);

    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...creator.utxos.toArray()])
      .to(reducedOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    const executionResult = mockChain.execute(tx, { signers: [creator], throw: false });
    expect(executionResult).to.be.false;
    
    expect(reputationProofContract.utxos.length).to.equal(1);
    expect(reputationProofContract.utxos.toArray()[0].assets).to.deep.equal([
      { tokenId: initialProofTokenId, amount: BigInt(initialTotalSupply) },
      { tokenId: secondaryTokenId, amount: secondaryTokenAmount }
    ]);
    expect(reputationProofContract.utxos.toArray()[0].additionalRegisters.R5).to.equal(SString("some-pointer"));
  });

  it("should split a high-value proof box, moving one token while preserving the original's value", () => {
    const initialTotalSupply = 100_000_000n;
    const initialValue = 5_000_000n; // Valor superior al mínimo
    const proofTokenId = generateTokenId("proof-high-value-split");

    const r7 = getCorrectR7(creator);

    reputationProofContract.addUTxOs({
      creationHeight: mockChain.height,
      ergoTree: reputationProofErgoTree.toHex(),
      value: initialValue,
      assets: [{ tokenId: proofTokenId, amount: initialTotalSupply }],
      additionalRegisters: {
        R4: SColl(SByte, hexToBytes(typeNftId) ?? "").toHex(),
        R5: SString("high-value-box"),
        R6: tupleToSerialized(false, Number(initialTotalSupply)),
        R7: r7,
        R8: booleanToSerializer(true),
        R9: SString(JSON.stringify({ note: "Initial high value box" }))
      }
    });
    const proofToSpend = reputationProofContract.utxos.toArray()[0];
    expect(proofToSpend.value).to.equal(initialValue);
    expect(reputationProofContract.utxos.length).to.equal(1);

    const amountToMove = 1n;
    const amountRemaining = initialTotalSupply - amountToMove;

    const newBoxOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, reputationProofContract.address)
      .addTokens([{ tokenId: proofTokenId, amount: amountToMove.toString() }])
      .setAdditionalRegisters({
        ...proofToSpend.additionalRegisters,
        R5: SString("high-value-box-split-1")
      });

    const recreatedBoxOutput = new OutputBuilder(initialValue, reputationProofContract.address)
      .addTokens([{ tokenId: proofTokenId, amount: amountRemaining.toString() }])
      .setAdditionalRegisters({
        ...proofToSpend.additionalRegisters,
        R5: SString("high-value-box-recreated")
      });
      
    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...creator.utxos.toArray()])
      .to([newBoxOutput, recreatedBoxOutput])
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;

    expect(reputationProofContract.utxos.length).to.equal(2);

    const newSmallBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === amountToMove);
    const recreatedHighValueBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === amountRemaining);

    expect(newSmallBox).to.not.be.undefined;
    expect(newSmallBox?.value).to.equal(SAFE_MIN_BOX_VALUE);
    expect(newSmallBox?.assets[0].amount).to.equal(amountToMove);

    expect(recreatedHighValueBox).to.not.be.undefined;
    expect(recreatedHighValueBox?.value).to.equal(initialValue);
    expect(recreatedHighValueBox?.assets[0].amount).to.equal(amountRemaining);
  });

});