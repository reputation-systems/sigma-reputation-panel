
export interface LinkedHash {
	algorithm: string | null;
	value: string;
}

export interface Opinion {
	proof_id: string;
	content: object
}

export interface LinkedObject {
	uuid: string,
	hashes: LinkedHash[],
	opinions: Opinion[]
}