/**
*
* Reputation Proof  -  
    

    R5     -> Pointer to the object type.                 ex: Box, git repo, url
    R6     -> Pointer to the object to assign reputation: ex: fjdfklj4314j3lk, https...
    R7     -> owner public key


    ** Where Box is an Ergo box.

    TODO: Limit the number of possible tokens to one
*/
let INPUT_PROOF: Box = SELF.INPUTS.filter({(x: Box) => x.propositionBytes == SELF.propositionBytes})[0];
let REST_OFF_NEW_PROOFS: Box[] = INPUT_PROOF.filter({(x: Box) => x.propositionBytes == SELF.propositionBytes});
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
proveDlog(SELF.R7[GroupElement].get) &&
    //
    // Assign them ONLY to other reputation proofs.
sigmaProp(SELF.tokens.length == 1) &&
sigmaProp(OUTPUTS.forall({(x: Box) => {
    x.tokens.length == 0 ||
    x.tokens[0][0] !== SELF.tokens[0][0] ||
    (
        x.tokens[0][0] == SELF.tokens[0][0] &&
        x.tokens[0][1] + REST_OFF_NEW_PROOFS.fold({(total: Int, x: Box) => total + x.tokens[0][1]}) = INPUT_PROOF.tokens[0][1]
        x.propositionBytes == SELF.propositionBytes
    )
}}))