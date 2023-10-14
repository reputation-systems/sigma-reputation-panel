{
    /**
     *
     * Reputation Proof
     *
     *
     */

    val pk = SELF.R4[Coll[bytes]]  //  Owner's public key
    if (pk.isDefined) {
        val owner = pk
    }
    /*
        elseif(SELF.INPUT(0).propositionBytes == SELF.propositionBytes) {
            val owner = SELF.INPUT(0).R4[Coll[bytes]]
        } else {
            false
        }
    */

    val object = SELF.R5[AssignedReputation]
    if (object.isDefined) {
        false   // No-one can spend if the reputation proof object is assigned.
    } else {
        // The proof's creator can spend the tokens (representation of reputation) and assign it ONLY to other reputation contracts.
        curve_eliptic(SELF.R4) && SELF.OUTPUT.all(x => x.propositionBytes == SELF.propositionBytes)

    }
}