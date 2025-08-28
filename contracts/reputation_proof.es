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
  /*
    El contrato requiere varios cambios.
    - typeIsValid debería asegurarse de los OUTPUTS, no del SELF ... (asegurar la creación no tiene sentido aqui, mas bien en fetch.ts)
    - allBoxesArePresent parece estar correcto.
    - validationLogic:
      - la primera condición debería asegurarse de que todos los tokens de salidas tengan el mismo token.
      - la segunda no llego a comprenderla del todo.
      - igualmente ... es importante asegurarse de que hablamos solo de los OUTPUTS con SEFL.propertyBytes
  */
  // --- Path 1: Admin Transaction (signed by the owner) ---
  val ownerSignedPath = {
    // The transaction must be signed by the owner of the key in R7.
    if (SELF.R7[SigmaProp].isDefined) {

      /*
      val typeNftBoxes = CONTEXT.dataInputs.filter { (b: Box) =>
        b.propositionBytes == DIGITAL_PUBLIC_GOOD
      }
      */
      
      // Extract data from this box's (SELF) register structure.
      val r6Tuple = SELF.R6[(Boolean, Long)].get
      val isLocked = r6Tuple._1
      val totalSupply = r6Tuple._2
      val repTokenId = SELF.tokens(0)._1
      
      // PROOF OF COMPLETENESS
      val repBoxesOnDataInputs = CONTEXT.dataInputs.filter { (b: Box) =>
        b.propositionBytes == SELF.propositionBytes &&
        b.tokens.size == 1 && b.tokens(0)._1 == repTokenId &&
        b.R6[(Boolean, Long)]._2 == totalSupply &&
        b.R4[Coll[Byte]].isDefined &&
        b.R5[Coll[Byte]].isDefined &&
        b.R6[(Boolean, Long)].isDefined &&
        b.R8[Boolean].isDefined
      }

      val repBoxesOnInputs = INPUTS.filter { (b: Box) =>
        b.propositionBytes == SELF.propositionBytes &&
        b.tokens.size == 1 && b.tokens(0)._1 == repTokenId &&
        b.R6[(Boolean, Long)]._2 == totalSupply &&
        b.R4[Coll[Byte]].isDefined &&
        b.R5[Coll[Byte]].isDefined &&
        b.R6[(Boolean, Long)].isDefined &&
        b.R8[Boolean].isDefined
      }

      val repBoxesOnOutputs = OUTPUTS.filter { (b: Box) =>
        b.propositionBytes == SELF.propositionBytes &&
        b.tokens.size == 1 && b.tokens(0)._1 == repTokenId &&
        b.R6[(Boolean, Long)]._2 == totalSupply &&
        b.R4[Coll[Byte]].isDefined &&
        b.R5[Coll[Byte]].isDefined &&
        b.R6[(Boolean, Long)].isDefined &&
        b.R8[Boolean].isDefined
      }

      val correctManagedSupply = {
        val dataInputsAmount = repBoxesOnDataInputs.fold(0L, { (sum: Long, b: Box) => sum + b.tokens(0)._2 })
        val inputsAmount = repBoxesOnInputs.fold(0L, { (sum: Long, b: Box) => sum + b.tokens(0)._2 })
        val outputsAmount = repBoxesOnOutputs.fold(0L, { (sum: Long, b: Box) => sum + b.tokens(0)._2 })
        
        (inputsAmount + dataInputsAmount) == totalSupply && // All boxes are present.
        inputsAmount == outputsAmount                    // All tokens are preserved.
      }
      
      // OUTPUTS VALIDATION
      val outputsValid = repBoxesOnOutputs.forall { (x: Box) =>
        {

            // val typeIsValid = x.R4[Coll[Byte]].get in typeNftBox.tokens(0)._1  <--  this sintax is not valid, but the idea is to check if R4 is a vaild type NFT id checking into a list of valid type NFTs

            val objectIsUnique = {
              // There is no data input pointing to the same object (R4, R5) as this output box.
              val uniqueInDataInputs = repBoxesOnDataInputs.forall { (d: Box) =>
                  (d.R4[Coll[Byte]].get, d.R5[Coll[Byte]].get) != (x.R4[Coll[Byte]].get, x.R5[Coll[Byte]].get)
              }

              // There is no other output box (except itself) pointing to the same object (R4, R5).
              val uniqueInOutputs = repBoxesOnOutputs.forall { (otherOut: Box) =>
                  (otherOut.id == x.id) ||
                  ((otherOut.R4[Coll[Byte]].get, otherOut.R5[Coll[Byte]].get) != (x.R4[Coll[Byte]].get, x.R5[Coll[Byte]].get))
              }
              uniqueInDataInputs && uniqueInOutputs
            }

            val ownerIsPreserved = x.R7[SigmaProp].get == SELF.R7[SigmaProp].get  // This could be relaxed if needed.

            objectIsUnique && ownerIsPreserved
        }
      }

      // LOCKING LOGIC
      val correctLock =  {
        if (isLocked) {
          repBoxesOnOutputs.exists { (x: Box) => {
            x.tokens(0)._2 >= SELF.tokens(0)._2 &&              // Preserve token amount or increase it.
            x.R4[Coll[Byte]].get == SELF.R4[Coll[Byte]].get &&  // Preserve type NFT ID.
            x.R5[Coll[Byte]].get == SELF.R5[Coll[Byte]].get &&  // Preserve unique object data.
            x.R6[(Boolean, Long)].get._1 == true &&             // Once locked, always locked.
            x.R9[Coll[Byte]].get == SELF.R9[Coll[Byte]].get     // Preserve reserved data.
          }}
        }
        else { true }
      }

      correctManagedSupply && outputsValid && correctLock
    } 
    else { false }
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