# **Decentralized Reputation System on Ergo**

[![Ergo Platform Badge](https://img.shields.io/badge/Built_on-Ergo-FBBF24)](https://ergoplatform.org)

## 1. Summary

This document describes a decentralized reputation system built on the Ergo blockchain. The system is designed to create, manage, and verify reputation claims in an atomic, secure, and transparent way. Its architecture is based on two interdependent ErgoScript contracts:

1. **"Digital Public Good" Contract (Type NFT)**: Defines immutable standards for the types of reputation that can exist in the ecosystem.
2. **"Reputation Token" Contract**: Governs the boxes (UTXOs) that contain the reputation proofs, ensuring state consistency, data uniqueness, and owner control.

The design leverages Ergo's eUTXO model to enable complex validations and ensure that reputation collections are updated atomically, preventing inconsistent states.

---

## 2. System Architecture

The system is composed of two types of boxes (UTXOs), each governed by a specific contract that defines its purpose and state transition rules.

### 2.1. "Digital Public Good" Contract (Type NFT)

This contract protects a box that contains a unique NFT, which serves as a public and immutable standard for a specific type of reputation.

#### **Purpose**

* **Standardization**: Defines a reputation type (e.g., “Verified URL”, “Smart Contract Review”) and its associated data structure.
* **Immutability**: Ensures that the type definition cannot be altered, providing a stable foundation for the entire ecosystem.
* **Digital Public Good**: The box is designed to be community-maintained, allowing ERG top-ups to cover storage rent without altering its contents.

#### **Register Structure**

| Register  | Type         | Description                                                                              |
| :-------- | :----------- | :--------------------------------------------------------------------------------------- |
| **R4**    | `Coll[Byte]` | `typeName`: Human-readable name of the type (e.g., “Web URL”).                           |
| **R5**    | `Coll[Byte]` | `description`: Purpose and use of the type.                                              |
| **R6**    | `Coll[Byte]` | `schemaURI`: URI to a schema (e.g., JSON Schema, IPFS) that defines the proof structure. |
| **R7**    | `Boolean`    | `isReputationProof`: `true` if used for reputation proofs, `false` otherwise.            |
| **R8-R9** | `(Empty)`    | Reserved for future extensions.                                                          |

#### **Spending Logic**

The contract enforces a single spending rule:

1. **Anyone can spend the box.**
2. The transaction is valid **only if it creates a single output box** that is an exact replica of the input in all aspects (script, NFT token, and registers R4-R9).
3. The only exception is the ERG value, which **must be greater than or equal to** (`successor.value >= SELF.value`), allowing for top-ups to pay for storage rent.

This logic prevents the destruction or duplication of the standard, ensuring its permanence and reliability.

> If R7 is active, then in the Reputation contract, R5 will be interpreted as referring to a token contained in boxes using a reputation script. If not active, R5 in the Reputation contract may contain any other definition as per the type standard.

### 2.2. "Reputation Token" Contract (Reputation Box)

This contract governs a box that represents an individual piece of reputation. These boxes form part of distributed collections that must maintain internal consistency.

#### **Purpose**

* **Governance**: Defines rules for creating, modifying, and transferring a reputation proof.
* **Atomic Consistency**: Ensures that an entire reputation collection (“sibling” boxes) is validated together.
* **Uniqueness**: Ensures that each reputation proof about an object is unique within its collection.
* **Owner Control**: Grants the owner exclusive authority over substantial modifications.

#### **Register and Token Structure**

| Element      | Type                 | Description                                                                                        |
| :----------- | :------------------- | :------------------------------------------------------------------------------------------------- |
| **Token(0)** | `(Coll[Byte], Long)` | `(repTokenId, amount)`: The reputation token protected by this box.                                |
| **R4**       | `Coll[Byte]`         | `typeNftTokenId`: Token ID of the associated Type NFT.                                             |
| **R5**       | `Coll[Byte]`         | `uniqueObjectData`: Data that, along with R4, uniquely identifies the object.                      |
| **R6**       | `(Boolean, Long)`    | `(isLocked, totalSupply)`: Tuple defining the lock state and total token supply of the collection. |
| **R7**       | `SigmaProp`          | `ownerPublicKey`: Public key of the owner that must authorize transactions.                        |
| **R8**       | `Boolean`            | `customFlag`: Boolean flag for custom application logic.                                           |
| **R9**       | `Coll[Byte]`         | Reserved for future extensions.                                                                    |

#### **Spending Logic (Two Paths)**

The contract allows the box to be spent via two distinct paths:

**2.2.1. Management Path (Signature Required)**

This path allows the owner to make significant changes to the reputation collection. It strictly requires:

1. **Authorization**: The transaction must be signed by the owner (`SELF.R7[SigmaProp]`).
2. **Link to Standard**: The corresponding **Type NFT** box must be included as `dataInputs(0)`. The `typeNftTokenId` (in R4) of the reputation box must match the NFT token ID.
3. **Proof of Completeness**: All “sibling” boxes sharing the same `repTokenId` must be included as `dataInputs`. The contract sums the `amount` of the tokens across all boxes (SELF + dataInputs) and checks that the total matches the `totalSupply` stored in R6. This ensures the transaction has a complete view of the distributed state.
4. **Output Rules**:

   * **Uniqueness**: The `(R4, R5)` combination of every output reputation box must be unique across all inputs and outputs.
   * **Preservation**: `totalSupply` and `ownerPublicKey` must remain unchanged in all outputs.
   * **Locking Logic (`isLocked`)**:

     * If `isLocked == true`, the box is immutable. The output must be an exact replica of the input (except for ERG value).
     * If `isLocked == false`, modifications are allowed, as long as the fundamental structure (script, defined registers) is preserved.

**2.2.2. ERG Top-Up Path (Public)**

This path does **not require a signature**, allowing anyone to top up the box with ERG to pay for storage rent. Conditions are identical to the Type NFT contract:

* The transaction must create a single output box.
* The output must be an **exact replica** of the input (script, tokens, and all registers).
* The ERG value of the output must be **greater than or equal to** the input.

---

## 3. System Interaction Flow

1. **Creating a Standard**: An entity creates a **Type NFT** to define a new reputation type (e.g., “Service Rating”). This NFT becomes an immutable digital public good.
2. **Issuing Reputation**: A user (the `owner`) creates one or more **Reputation Boxes**. R4 specifies the corresponding `Type NFT` ID. R5 contains unique data about the rated object. R7 stores the user's public key.
3. **Atomic Management**: To modify any part of their reputation collection (e.g., update a rating or add a new one), the owner must execute a transaction through the **Management Path**. All reputation boxes must be included in `dataInputs` so the contract can validate `totalSupply` and data uniqueness.
4. **Maintenance**: Any user may, at any time, top up a Reputation Box or a Type NFT with ERG via the **Top-Up Path**, ensuring system longevity without requiring owner intervention.

---

## 4. Conclusion

This reputation system offers a robust and formally verifiable model for managing trust assertions in a decentralized environment. Key features of the design include:

* **Immutability of Standards**: Type NFTs provide a permanently anchored foundation of trust.
* **User Ownership and Control**: Signature keys ensure only the owner can make substantial changes.
* **Atomic State Consistency**: Prevents state fragmentation and ensures collections are validated as coherent wholes.
* **Long-Term Sustainability**: Public top-up paths ensure that boxes are not lost due to Ergo’s storage rent.

The system transforms reputation management into a transparent, secure, and mathematically rigorous process, fully aligned with the principles of Ergo's eUTXO model.
