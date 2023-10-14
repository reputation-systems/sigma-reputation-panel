/**
*
* Reputation Proof  -   2Ud2Ryh6MkC8Lstg1BiSE86Vbs7FTBdChEMo2c3ZK3pyGaQoY2Ck9QQiz2n4vWP6
    

    R4 -> owner public key
    R5 -> Reputation on-chain object
    R6 -> Reputation off-chain object  (ex: (git_repo, github.com/ergoplatform/ergodocs), (url, https://api.ergoplatform.com/api/v1/docs/))

    TODO: Define AssignedReputation
    TODO: Limit the number of possible tokens to one
    TODO: Use only R5 for ReputationObject
*/
    // An optional object where the proof assign it's reputation 
    // (it could be different types of data, like other Reputation systems, urls, git repositories, etc).
SELF.R5[Box].isDefined != true &&
SELF.R6[(Coll[Byte], Coll[Byte])].isDefined != true &&
    // 
    // The proof's creator (or, at least, the one chosen by the box's creator) can spend the tokens
    // Owner's public key.  Without it, the box can't be expended. 
proveDlog(decodePoint(SELF.R4[Coll[Byte]].get)) &&
    //
    // Assign them ONLY to other reputation proofs.
OUTPUTS.forall({(x: Box) => x.propositionBytes == SELF.propositionBytes})