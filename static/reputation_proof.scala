/**
*
* Reputation Proof
    R5     -> Pointer to the object type.                 ex: Box, git repo, url
    R6     -> Pointer to the object to assign reputation: ex: fjdfklj4314j3lk, https...
    R7     -> owner public key
*/
{
    proveDlog(SELF.R7[GroupElement].get) &&
    sigmaProp(SELF.tokens.size == 1) &&
    sigmaProp(OUTPUTS.forall { (x: Box) =>
      !(x.tokens.exists { (token: (Coll[Byte], Long)) => token._1 == SELF.tokens(0)._1 }) ||
      (
        x.R7[GroupElement].get == SELF.R7[GroupElement].get &&
        x.tokens.size == 1 &&
        x.propositionBytes == SELF.propositionBytes
      )
    })
}