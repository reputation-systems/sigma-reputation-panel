import { ErgoAddress, SGroupElement, SSigmaProp } from "@fleet-sdk/core";

export function serializedToRendered(serializedValue: string): string {
    // Assuming the serialized value always starts with a pattern to strip (e.g., '0e')
    const patternToStrip = '0e';
    if (serializedValue.startsWith(patternToStrip)) {
        // Remove the pattern and return the hex string
        return serializedValue.substring(patternToStrip.length).substring(2);
    } else {
        // If the pattern does not exist at the start, return the original string
        return serializedValue.substring(2);
    }
}

export function generate_pk_proposition(wallet_pk: string): string {
    const pk = ErgoAddress.fromBase58(wallet_pk).getPublicKeys()[0];
    const encodedProp = SGroupElement(pk);
    return encodedProp.toHex();
}