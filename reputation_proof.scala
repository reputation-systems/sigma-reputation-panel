/**
*
* Reputation Proof  -  
    

    R5     -> Pointer to the object type.                 ex: Box, git repo, url
    R6     -> Pointer to the object to assign reputation: ex: fjdfklj4314j3lk... github.com/ergoplatform/ergodocs, https://api.ergoplatform.com/api/v1/docs/
    R7     -> owner public key


    ** Where Box is an Ergo box.

    TODO: Limit the number of possible tokens to one
*/
    // An optional object where the proof assign it's reputation 
    // (it could be different types of data, like other Reputation systems, urls, git repositories, etc).
    //
    //
// ENVIROMENT_VARIABLE_THAT_ALLOWS_SPEND_OR_NOT &&
// SELF.R6[Coll[Byte]].isDefined != true &&
    // 
    //
    // The proof's creator (or, at least, the one chosen by the box's creator) can spend the tokens
    // Owner's public key.  Without it, the box can't be expended. 
proveDlog(decodePoint(SELF.R7[Coll[Byte]].get)) &&
    //
    // Assign them ONLY to other reputation proofs.
OUTPUTS.forall({(x: Box) => x.propositionBytes == SELF.propositionBytes})