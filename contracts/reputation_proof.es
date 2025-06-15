/**
* ===================================================================================
* Contract for a "Reputation Token"
* ===================================================================================
*
* PURPOSE:
* To govern a box that is part of a collection of "reputation" boxes.
* This contract ensures that the entire collection remains coherent, that data
* is unique, and that only the owner can authorize changes. It acts as a
* piece of a distributed state that is validated atomically.
*
* SPENDING RULES:
* There are two ways to spend this box:
*
* 1. ADMIN PATH (SIGNATURE REQUIRED):
* a. AUTHORIZATION: The transaction must be signed by the owner (R7).
* b. BINDING TO A STANDARD: The "Type NFT" box must be provided
* in dataInputs[0]. The R4 register must match the token ID of that NFT.
* c. PROOF OF COMPLETENESS: All "sibling" boxes in the collection must
* be included in the dataInputs to verify the `totalSupply` (R6).
* d. OUTPUT RULES: Rules for uniqueness, metadata preservation,
* and locking logic (frozen/mutable) apply.
*
* 2. ERG TOP-UP PATH (PUBLIC AND SIGNATURE-FREE):
* a. ANYONE can spend this box to prevent "demurrage" (storage rent).
* b. CONDITION: The transaction is only valid if it creates a single output box that
* is an EXACT REPLICA of the input (same tokens, registers, and script),
* but with an equal or greater ERG value. No other changes are allowed.
*
* RECOMMENDED REGISTER AND TOKEN STRUCTURE:
* -----------------------------------------------------------------------------------
* Token(0): (Coll[Byte], Long) -> (repTokenId, amount)
* - Purpose: The reputation token that this contract protects.
*
* R4: Coll[Byte]               -> typeNftTokenId
* - Purpose: ID of the "Type NFT" token to which this box adheres.
*
* R5: Coll[Byte]               -> uniqueObjectData
* - Purpose: Data that, together with R4, uniquely identifies this object
* within the collection.
*
* R6: (Boolean, Long)          -> (isLocked, totalSupply)
* - Purpose: A tuple that stores the lock status and the total token supply
* of the collection.
*
* R7: SigmaProp                -> ownerPublicKey
* - Purpose: Public key of the owner who must sign the transaction.
*
* R8: Boolean                  -> customFlag
* - Purpose: A boolean flag for custom application logic.
*
* R9: Coll[Byte]               -> reserved_1
* - Purpose: Reserved for future extensions.
* -----------------------------------------------------------------------------------
*/
{
  // --- Path 1: Admin Transaction (signed by the owner) ---
  val ownerSignedPath = {
    // The transaction must be signed by the owner of the key in R7.
    if (SELF.R7[SigmaProp].isDefined) {
      // The "Type NFT" box is required in dataInputs(0).
      val typeNftBox = CONTEXT.dataInputs(0)
      
      // TYPE VALIDATION: This box's R4 must match the token ID of the Type NFT.
      val typeIsValid = SELF.R4[Coll[Byte]].get == typeNftBox.tokens(0)._1

      // Extract data from this box's (SELF) register structure.
      val r6Tuple = SELF.R6[(Boolean, Long)].get
      val isLocked = r6Tuple._1
      val totalSupply = r6Tuple._2
      val repTokenId = SELF.tokens(0)._1
      
      // PROOF OF COMPLETENESS:
      val otherReputationBoxes = CONTEXT.dataInputs.slice(1, CONTEXT.dataInputs.size)
      val dataInputsAmount = otherReputationBoxes.fold(0L, { (sum: Long, b: Box) =>
        if (b.tokens.size > 0 && b.tokens(0)._1 == repTokenId) {
          sum + b.tokens(0)._2
        } else {
          sum
        }
      })
      val allBoxesArePresent = (SELF.tokens(0)._2 + dataInputsAmount) == totalSupply
      
      val validationLogic = OUTPUTS.forall { (x: Box) =>
        !(x.tokens.exists { (token: (Coll[Byte], Long)) => token._1 == repTokenId }) || {
          val uniqueInDataInputs = otherReputationBoxes.forall { (d: Box) =>
              (d.id == SELF.id) || ((d.R4[Coll[Byte]].get, d.R5[Coll[Byte]].get) != (x.R4[Coll[Byte]].get, x.R5[Coll[Byte]].get))
          }
          val uniqueInOutputs = OUTPUTS.forall { (otherOut: Box) =>
              (otherOut.id == x.id) || !(otherOut.tokens.exists { (t: (Coll[Byte], Long)) => t._1 == repTokenId }) ||
              ((otherOut.R4[Coll[Byte]].get, otherOut.R5[Coll[Byte]].get) != (x.R4[Coll[Byte]].get, x.R5[Coll[Byte]].get))
          }
          val objectIsUnique = uniqueInDataInputs && uniqueInOutputs
          
          val outputR6Tuple = x.R6[(Boolean, Long)].get
          val totalSupplyIsPreserved = outputR6Tuple._2 == totalSupply
          val ownerIsPreserved = x.R7[SigmaProp].get == SELF.R7[SigmaProp].get
          
          val lockResult = {
            if (isLocked) {
              x.tokens(0)._2 == SELF.tokens(0)._2 &&
              x.propositionBytes == SELF.propositionBytes &&
              x.R4[Coll[Byte]].get == SELF.R4[Coll[Byte]].get &&
              x.R5[Coll[Byte]].get == SELF.R5[Coll[Byte]].get &&
              outputR6Tuple._1 == isLocked &&
              x.R8[Boolean].get == SELF.R8[Boolean].get &&
              x.R9[Coll[Byte]].get == SELF.R9[Coll[Byte]].get
            } else {
              x.propositionBytes == SELF.propositionBytes &&
              x.R4[Coll[Byte]].isDefined &&
              x.R5[Coll[Byte]].isDefined &&
              x.R6[(Boolean, Long)].isDefined &&
              x.R8[Boolean].isDefined
            }
          }
          objectIsUnique && totalSupplyIsPreserved && ownerIsPreserved && lockResult
        }
      }
      typeIsValid && allBoxesArePresent && validationLogic
    } else {
      false
    }
  }

  // --- Path 2: ERG Top-Up (public, no signature) ---
  val publicTopUpPath = {
    // Filter the outputs to find the one that is a successor to this box.
    val successorOutputs = OUTPUTS.filter { (box: Box) =>
      box.propositionBytes == SELF.propositionBytes &&
      box.tokens.size > 0 &&
      box.tokens(0)._1 == SELF.tokens(0)._1
    }

    // If exactly one successor is found...
    if (successorOutputs.size == 1) {
      val successor = successorOutputs(0)

      // Define the conditions for total immutability.
      val registersAreImmutable = (
        successor.R4[Coll[Byte]] == SELF.R4[Coll[Byte]] &&
        successor.R5[Coll[Byte]] == SELF.R5[Coll[Byte]] &&
        successor.R6[(Boolean, Long)] == SELF.R6[(Boolean, Long)] &&
        successor.R7[SigmaProp] == SELF.R7[SigmaProp] &&
        successor.R8[Boolean] == SELF.R8[Boolean] &&
        successor.R9[Coll[Byte]] == SELF.R9[Coll[Byte]]
      )
      
      val tokensAreImmutable = successor.tokens == SELF.tokens
      
      // The ERG value of the output must be greater than or equal to the input's.
      val canOnlyAddErgs = successor.value >= SELF.value

      // The transaction is valid if everything is immutable and only ERGs are added.
      registersAreImmutable && tokensAreImmutable && canOnlyAddErgs
    } else {
      false
    }
  }
  
  // The transaction is valid if it meets the owner path OR the public top-up path.
  sigmaProp(ownerSignedPath || publicTopUpPath)
}