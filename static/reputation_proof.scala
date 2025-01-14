/**
*
* Reputation Proof
    R5     -> Pointer to the object type.                 ex: Box, git repo, url
    R6     -> Pointer to the object to assign reputation: ex: fjdfklj4314j3lk, https...
    R7     -> Owner public key
    R8     -> Polarization
*/
{
    SELF.R7[SigmaProp].get &&
    sigmaProp(SELF.tokens.size == 1) &&
    sigmaProp(OUTPUTS.forall { (x: Box) =>
    !(x.tokens.exists { (token: (Coll[Byte], Long)) => token._1 == SELF.tokens(0)._1 }) ||
    (
        x.R7[SigmaProp].get == SELF.R7[SigmaProp].get &&
        x.tokens.size == 1 &&
        x.propositionBytes == SELF.propositionBytes &&
        (x.R8[Boolean].get == false || x.R8[Boolean].get == true)
    )
    })
}