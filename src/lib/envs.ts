import { compile } from "@fleet-sdk/compiler";

export const explorer_uri = "https://api.ergoplatform.com";

// let contract = "{proveDlog(decodePoint(SELF.getReg(7).get)) && sigmaProp(OUTPUTS.forall(v1 => v1.propBytes == SELF.propBytes))}";

let contract = "{proveDlog(CONTEXT.preHeader.minerPk)}"
let ergoTree = compile(contract).toBytes()
let ergoTreeHash = "E5F0CD9A2DD463FF71EA56A2F4E94E442DFFCB630E79B08C20E840540D136CC3"  // sha256(compile(contract).toHex()).hexdigest()

export const ergo_tree_hash = ergoTreeHash
export const ergo_tree = ergoTree;


/**  QUESTIONS TO DISCORD. -  https://discord.com/channels/668903786361651200/840313005064585246/1171166391316000821

Hi all, I've a few questions about the ergoTree usage with fleetSDK and the ergo explorer.

I want to do two diferent things:

1. Put the ergoTree on an output box, for that I have something like:

    
        import { compile } from "@fleet-sdk/compiler";

        let script = "{proveDlog(CONTEXT.preHeader.minerPk)}"
        let ergoTree = compile(script).toBytes()
        import {
            OutputBuilder,
            SAFE_MIN_BOX_VALUE,
        } from '@fleet-sdk/core';

        const builder = new OutputBuilder(
            SAFE_MIN_BOX_VALUE,
            wallet_pk
        ).mintToken({
            amount: token_amount, // the amount of tokens being minted without decimals
        }).setAdditionalRegisters({
            R1: SConstant(SColl(SByte, ergoTree))
        })
    

    This gives me an error like: "code: 1, info: 'failed to parse register id at line 1 column 2277'""   (Works without the R1, and with other registries)

    Should I use something like ?:
   
        .setAdditionalRegisters({
            R1: SConstant(SColl(SByte, stringToBytes('utf8', compile(script).toHex())))
        })
    

    There is another way to add the script? 




2. Search on the explorer unexpended boxes with this script:  (I haven't tried this, I mention it in case someone knows beforehand.)
    For that i am using this method: https://api.ergoplatform.com/api/v1/docs/#operation/postApiV1BoxesUnspentSearch

    On it, what is exactly the ergoTreeTemplateHash? 
    - the hexadecimal of the sha256 of the hexadecimal ergotree -> sha256(compile(script).toHex()).hexdigest()
    - another ... ??


Thanks.

 */