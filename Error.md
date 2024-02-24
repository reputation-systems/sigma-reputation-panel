
// https://github.com/ergoplatform/ergoscript-by-example/blob/main/selfReplicatingTokenSale.md

// https://github.com/ergoplatform/ergoscript-by-example/blob/main/singleChainSwap.md


    // With developed offchain tooling , you can store group element (elliptic curve point) in a register directly

    // https://docs.ergoplatform.com/dev/scs/global-functions/#decodepoint
    // R7 Should be Coll[Byte] representing a Group Element of a eliptic curve

    // https://docs.ergoplatform.com/dev/scs/types/sigmaboolean/


    // hex public key sigma boolean: 08cd03743b2362c7c30aa5bc1a24e9987df4401bf30d5b7dfbd4b1415434a2671359e6
    // base 64 encoding: CM0DdDsjYsfDCqW8GiTpmH30QBvzDVt9+9SxQVQ0omcTWeY=



----

Cuando se utiliza el sigma prop sin codificacion base 64 y con R7:
(Segun Kushti: https://discord.com/channels/668903786361651200/669989266478202917/1162828559350505512)

- Se agrega el registro R7: 
const pk = ErgoAddress.fromBase58(wallet_pk).getPublicKeys()[0];
    const encodedProp = SSigmaProp(SGroupElement(pk)).toHex()
    console.log(encodedProp)
    builder.setAdditionalRegisters({...registers, ...{R7: encodedProp}})

- Y el contrato:
{
    val encoded = SELF.R7[Coll[Byte]].get
    val z = decodePoint(encoded)
    proveDlog(z);
}

- Salta el error:
"Transaction signing error: Prover error (tx input index 0): Evaluation error: eval error:   x Evaluation error
   ,----
 1 | proveDlog(decodePoint(SELF.getReg(7).get))
   : ^
   : `-- Unexpected value type: TryExtractFromError("expected \"alloc::vec::Vec<i8>\", found SigmaProp(SigmaProp(ProofOfKnowledge(ProveDlog(ProveDlog { h: EC:03743b2362c7c30aa5bc1a24e9987df4401bf30d5b7dfbd4b1415434a2671359e6 }))))")
   `----
"


# ¿Se está obteniendo correctamente la clave publica? ¿Es esa clave publica el punto de la curva eliptica?





# ¿Y si hay que hacer una igualdad?

- Y el contrato:
{
    val encoded = SELF.R7[Coll[Byte]].get
    val z = decodePoint(encoded)
    proveDlog(z) == PK(); // ??
}

