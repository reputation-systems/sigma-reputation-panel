import * as crypto from 'crypto';

export function calculateSHA256(input: string): string {
  // Create a hash object
  const sha256 = crypto.createHash('sha256');

  // Update the hash with the data to be hashed
  sha256.update(input);

  // Generate the digest (hash value) in hexadecimal format
  const hash = sha256.digest('hex');

  return hash;
}