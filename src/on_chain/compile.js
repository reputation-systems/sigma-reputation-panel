import { compile } from "@fleet-sdk/compiler";
import fs from 'fs';

const contract =  fs.readFileSync('src/on_chain/reputation_proof.scala', 'utf8');
const contractAddress = compile(contract).toAddress().toString()
console.log(contractAddress)