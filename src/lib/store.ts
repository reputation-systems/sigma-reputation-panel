import { writable } from 'svelte/store';
import type { ReputationProof } from './ReputationProof';

// Main store for holding fetched reputation proofs, keyed by token ID.
export const proofs = writable<Map<string, ReputationProof>>(new Map());

// UI state stores
export const advance_mode = writable<boolean>(false);
export const fetch_all = writable<boolean>(true); // Fetch all proofs or only the user's
export const building_graph = writable<boolean | null>(null);

// Wallet and connection state stores
export const address = writable<string|null>(null);
export const network = writable<string|null>(null);
export const connected = writable<boolean>(false);

// App logic stores
export const compute_deep_level = writable<number>(5); // Max depth for recursive computation
export const searchStore = writable<string|null>(null);
export const data_store = writable<any | null>(null);