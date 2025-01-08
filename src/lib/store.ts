import { writable } from 'svelte/store';
import type { ReputationProof } from './ReputationProof';

export const proofs = writable<Map<string, ReputationProof>>(new Map());
export const show_header = writable<boolean>(true);
export const advance_mode = writable<boolean>(true);
export const fetch_all = writable<boolean>(true);
export const address = writable<string|null>(null);
export const network = writable<string|null>(null);
export const compute_deep_level = writable<number>(5);
export const searchStore = writable<string|null>(null);
export const connected = writable<boolean>(false);
export const show_app = writable<boolean>(false);
export const data_store = writable<any | null>(null);