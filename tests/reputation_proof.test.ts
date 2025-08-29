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

// --- Funciones Auxiliares de Serialización (similares a utils.ts) ---

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

// --- Carga y Compilación de Contratos ---

const contractsDir = path.resolve(__dirname, "../contracts"); // Asegúrate de que la ruta a tus contratos es correcta

// Contrato para el "Type NFT"
const DIGITAL_PUBLIC_GOOD_SOURCE = fs.readFileSync(path.join(contractsDir, "digital_public_good.es"), "utf-8");
const digitalPublicGoodErgoTree = compile(DIGITAL_PUBLIC_GOOD_SOURCE, { version: 1 });
const digitalPublicGoodScriptHash = uint8ArrayToHex(blake2b256(digitalPublicGoodErgoTree.bytes));

// Contrato principal para la Prueba de Reputación
const REPUTATION_PROOF_SOURCE_TEMPLATE = fs.readFileSync(path.join(contractsDir, "reputation_proof.es"), "utf-8");
const REPUTATION_PROOF_SOURCE = REPUTATION_PROOF_SOURCE_TEMPLATE.replace("`+DIGITAL_PUBLIC_GOOD_SCRIPT_HASH+`", digitalPublicGoodScriptHash);
const reputationProofErgoTree = compile(REPUTATION_PROOF_SOURCE, { version: 1 });


describe("Reputation Proof Contract Tests", () => {
  let mockChain: MockChain;
  let creator: ReturnType<MockChain["newParty"]>;
  
  // Partidos de Contratos
  let reputationProofContract: ReturnType<MockChain["addParty"]>;
  let digitalPublicGoodContract: ReturnType<MockChain["addParty"]>;

  // Cajas y Tokens reutilizables
  let typeNftBox: Box<Amount>;
  const typeNftId = "01c236e723a189c99e9c9380dc48a6058e888c88e9a107df1c0519d0a5bf838e";

  afterEach(() => {
    mockChain.reset();
  });

  beforeEach(() => {
    mockChain = new MockChain({ height: 800_000 });

    // --- Actores ---
    creator = mockChain.newParty("Creator");
    creator.addBalance({ nanoergs: 10_000_000n }); // 0.01 ERG

    // --- Partidos de Contratos ---
    reputationProofContract = mockChain.addParty(reputationProofErgoTree.toHex(), "ReputationProofContract");
    digitalPublicGoodContract = mockChain.addParty(digitalPublicGoodErgoTree.toHex(), "DigitalPublicGoodContract");

    // --- Creación de la caja "Type NFT" (usada en dataInputs) ---
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

    // --- Definición del Output de la prueba de reputación ---
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

    // --- Construcción de la Transacción ---
    const tx = new TransactionBuilder(currentHeight)
      .from(creator.utxos)
      .to(newProofOutput)
      .withDataFrom([typeNftBox])
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();
    
    // --- Ejecución y Verificación ---
    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;
    
    expect(reputationProofContract.utxos.length).to.equal(1);
    const createdBox = reputationProofContract.utxos.toArray()[0];
    const mintedTokenId = createdBox.assets[0].tokenId;
    
    expect(mintedTokenId).to.equal(tx.inputs[0].boxId); // El token ID es el ID de la primera caja de entrada
    expect(createdBox.assets[0].amount).to.equal(BigInt(totalSupply));
    expect(createdBox.additionalRegisters.R4).to.equal(SString(typeNftId));
    expect(createdBox.additionalRegisters.R5).to.equal(SString(objectPointer));
    expect(createdBox.additionalRegisters.R8).to.equal(booleanToSerializer(true));
  });

  it("should update an existing reputation proof by splitting it", () => {
    // --- Estado Inicial: Crear una prueba de reputación para ser gastada ---
    const initialTotalSupply = 1000;
    const initialObjectPointer = "https://github.com/ergoplatform";
    const creatorPkBytes = creator.address.getPublicKeys()[0];
    const initialProofTokenId = "a".repeat(64); // ID de token predecible

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

    // --- Parámetros para la actualización ---
    const updatedAmount = 200;
    const changeAmount = initialTotalSupply - updatedAmount; // 800
    const updatedObjectPointer = "https://google.io";
    const updatedPolarization = false; // Cambiar a negativo

    // --- Definición de los Outputs ---
    // 1. La caja actualizada con nuevos datos y 200 tokens
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

    // 2. La caja de "cambio" con los 800 tokens restantes y los registros originales
    const changeProofOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE, reputationProofContract.address)
      .addTokens([{ tokenId: initialProofTokenId, amount: changeAmount.toString() }])
      .setAdditionalRegisters(proofToSpend.additionalRegisters);
    
    // --- Construcción de la Transacción ---
    const tx = new TransactionBuilder(mockChain.height)
      .from([proofToSpend, ...creator.utxos.toArray()])
      .to([updatedProofOutput, changeProofOutput])
      .withDataFrom([typeNftBox]) // La "Proof of Completeness" se satisface porque el 100% del suministro está en los inputs.
      .sendChangeTo(creator.address)
      .payFee(RECOMMENDED_MIN_FEE_VALUE)
      .build();

    // --- Ejecución y Verificación ---
    const executionResult = mockChain.execute(tx, { signers: [creator] });
    expect(executionResult).to.be.true;

    expect(reputationProofContract.utxos.length).to.equal(2);

    // Verificar la caja actualizada
    const updatedBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === BigInt(updatedAmount));
    expect(updatedBox).to.not.be.undefined;
    expect(updatedBox?.additionalRegisters.R5).to.equal(SString(updatedObjectPointer));
    expect(updatedBox?.additionalRegisters.R8).to.equal(booleanToSerializer(updatedPolarization));

    // Verificar la caja de cambio
    const changeBox = reputationProofContract.utxos.toArray().find(box => box.assets[0].amount === BigInt(changeAmount));
    expect(changeBox).to.not.be.undefined;
    expect(changeBox?.additionalRegisters.R5).to.equal(SString(initialObjectPointer)); // Debe mantener el R5 original
    expect(changeBox?.additionalRegisters).to.deep.equal(proofToSpend.additionalRegisters);
  });
});