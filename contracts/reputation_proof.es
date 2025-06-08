{
  // --- 1. GLOBAL VALIDATION AND AUTHORIZATION ---

  // The Type NFT box is required to be in dataInputs(0).
  val typeNftBox = CONTEXT.dataInputs(0)
  
  // TYPE VALIDATION: This box's R4 must match the token ID of the Type NFT.
  val typeIsValid = SELF.R4[Coll[Byte]].get == typeNftBox.tokens(0)._1

  // Extract data from this box's (SELF) register structure.
  val r6Tuple = SELF.R6[(Boolean, Long)].get
  val isLocked = r6Tuple._1
  val totalSupply = r6Tuple._2
  val repTokenId = SELF.tokens(0)._1
  
  // COMPLETENESS PROOF:
  // Sum the tokens from the sibling boxes, which are now in dataInputs starting from index 1.
  val otherReputationBoxes = CONTEXT.dataInputs.slice(1, CONTEXT.dataInputs.size)
  val dataInputsAmount = otherReputationBoxes.fold(0L, { (sum: Long, b: Box) =>
    if (b.tokens.size > 0 && b.tokens(0)._1 == repTokenId) {
      sum + b.tokens(0)._2
    } else {
      sum
    }
  })
  val allBoxesArePresent = (SELF.tokens(0)._2 + dataInputsAmount) == totalSupply
  
  // SIGNATURE VERIFICATION: The transaction must be signed by the owner of the key in R7.
  SELF.R7[SigmaProp].get &&
  typeIsValid &&
  allBoxesArePresent &&
  sigmaProp(OUTPUTS.forall { (x: Box) =>
    !(x.tokens.exists { (token: (Coll[Byte], Long)) => token._1 == repTokenId }) ||
    {
      // UNIQUENESS: Checked against the sibling boxes in dataInputs(1..N).
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
          // --- LOCKED STATE ---
          x.tokens(0)._2 == SELF.tokens(0)._2 &&
          x.propositionBytes == SELF.propositionBytes &&
          x.R4[Coll[Byte]].get == SELF.R4[Coll[Byte]].get &&
          x.R5[Coll[Byte]].get == SELF.R5[Coll[Byte]].get &&
          outputR6Tuple._1 == isLocked &&
          x.R8[Boolean].get == SELF.R8[Boolean].get &&
          x.R9[Coll[Byte]].get == SELF.R9[Coll[Byte]].get
        } else {
          // --- UNLOCKED STATE ---
          x.propositionBytes == SELF.propositionBytes &&
          x.R4[Coll[Byte]].isDefined &&
          x.R5[Coll[Byte]].isDefined &&
          x.R6[(Boolean, Long)].isDefined &&
          x.R8[Boolean].isDefined
        }
      }

      objectIsUnique && totalSupplyIsPreserved && ownerIsPreserved && lockResult
    }
  })
}