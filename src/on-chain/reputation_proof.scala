/**
*
* Reputation Proof
*
*
*/

! SELF.R5[AssignedReputation].isDefined &&  // An optional object where the proof assign it's reputation (it could be different types of data, like other Reputation systems, urls, git repositories, etc).
{
    val owner = SELF.R4[SigmaProp].get  // Owner's public key. 
    sigmaProp(owner.isDefined && owner)  // Without it, the box can't be expended.
} &&  // The proof's creator (or, at least, the one chosen by the box's creator) can spend the tokens
OUTPUTS.forall({(x: Box) => x.propositionBytes == SELF.propositionBytes})   // Assign them ONLY to other reputation contracts.