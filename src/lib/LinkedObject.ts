/**
 * Represents a cryptographic hash linked to an object.
 */
export interface LinkedHash {
	algorithm: string | null;
	value: string;
}

/**
 * Represents an opinion or proof linked to an object.
 */
export interface Opinion {
	proof_id: string;
	content: object;
}

/**
 * Represents a comprehensive linked object with hashes and associated opinions.
 */
export interface LinkedObject {
	uuid: string,
	hashes: LinkedHash[],
	opinions: Opinion[];
}