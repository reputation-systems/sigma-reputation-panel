
export interface LinkedHash {
	algorithm: string | null;
	value: string;
}

export interface LinkedObject {
	uuid: string,
	hashes: LinkedHash[]
}