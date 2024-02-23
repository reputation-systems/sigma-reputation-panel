
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



-------

Si se utiliza sin base 64 y sin R7:


- El contrato:
{
    val encoded = "08cd03743b2362c7c30aa5bc1a24e9987df4401bf30d5b7dfbd4b1415434a2671359e6"
    val z = decodePoint(encoded)
    proveDlog(z);
}


- No se puede compilar el contrato:
line 3:     val z = decodePoint(encoded)
                    ^
Invalid argument type of application Apply(Ident(decodePoint,NoType),ArraySeq(Ident(encoded,NoType))): expected ArraySeq(Coll[SByte$]); actual after typing: ArraySeq(SString)


----

Cuando se utiliza el sigma prop sin codificacion base 64 y con R7, pero sin decodePoint, suponiendo que no nos hace falta (https://docs.ergoplatform.com/dev/scs/global-functions/#decodepoint):
(Segun Kushti: https://discord.com/channels/668903786361651200/669989266478202917/1162828559350505512)

- Se agrega el registro R7: 
const pk = ErgoAddress.fromBase58(wallet_pk).getPublicKeys()[0];
    const encodedProp = SSigmaProp(SGroupElement(pk)).toHex()
    console.log(encodedProp)
    builder.setAdditionalRegisters({...registers, ...{R7: encodedProp}})

- Y el contrato:
{
    val z = SELF.R7[Coll[Byte]].get
    proveDlog(z);
}


- Salta el error al compilar:

sigmastate.exceptions.TyperException: 
line 3:     proveDlog(z);
            ^
Invalid argument type of application Apply(Ident(proveDlog,NoType),ArraySeq(Ident(z,NoType))): expected ArraySeq(SGroupElement); actual after typing: ArraySeq(Coll[SByte$])


-----


----

Cuando se utiliza el sigma prop sin codificacion base 64 y con R7, pero sin decodePoint, suponiendo que no nos hace falta (https://docs.ergoplatform.com/dev/scs/global-functions/#decodepoint):
(Segun Kushti: https://discord.com/channels/668903786361651200/669989266478202917/1162828559350505512)

- Se agrega el registro R7: 
const pk = ErgoAddress.fromBase58(wallet_pk).getPublicKeys()[0];
    const encodedProp = SSigmaProp(SGroupElement(pk)).toHex()
    console.log(encodedProp)
    builder.setAdditionalRegisters({...registers, ...{R7: encodedProp}})

- Y el contrato:
{
    val z = SELF.R7[GroupElement].get
    proveDlog(z);
}


- Y salta:
"Transaction signing error: Prover error (tx input index 0): Evaluation error: eval error:   x Evaluation error
   ,----
 1 | proveDlog(SELF.getReg(7).get)
   : ^
   : `-- Unexpected value: Expected CreateProveDlog input to be Value::GroupElement, got SigmaProp(SigmaProp(ProofOfKnowledge(ProveDlog(ProveDlog { h: EC:03743b2362c7c30aa5bc1a24e9987df4401bf30d5b7dfbd4b1415434a2671359e6 }))))
   `----
"

------

Con R7 y base 64

- Se agrega el registro R7: 
const pk = ErgoAddress.fromBase58(wallet_pk).getPublicKeys()[0];
    const encodedProp = base64.encode(SSigmaProp(SGroupElement(pk)).toBytes());
    console.log(encodedProp)
    builder.setAdditionalRegisters({...registers, ...{R7: encodedProp}})


- Y el contrato:
¿Que tipo debe de tener R7?

------

Sin R7 y base 64


- Y el contrato:

let contract = `{
    val encoded = fromBase64("CM0DdDsjYsfDCqW8GiTpmH30QBvzDVt9+9SxQVQ0omcTWeY=")
    val z = decodePoint(encoded)
    proveDlog(z);
}`;

- Y salta:
"Transaction signing error: Prover error (tx input index 0): Evaluation error: eval error:   x Evaluation error
   ,----
 1 | proveDlog(decodePoint("08cd03743b2362c7c30aa5bc1a24e9987df4401bf30d5b7dfbd4b1415434a2671359e6"))
   : ^
   : `-- error: DecodePoint: Failed to parse EC point from bytes [8, 205, 3, 116, 59, 35, 98, 199, 195, 10, 165, 188, 26, 36, 233, 152, 125, 244, 64, 27, 243, 13, 91, 125, 251, 212, 177, 65, 84, 52, 162, 103, 19, 89, 230]
   `----
"

--------
--------


¿Y si hay que hacer una igualdad? (con base 64 no falla)

¿Se está obteniendo correctamente la clave publica? ¿Es esa clave publica el punto de la curva eliptica?

