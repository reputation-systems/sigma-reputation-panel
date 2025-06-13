import { writable } from 'svelte/store';
import type { ReputationProof, TypeNFT } from './ReputationProof';

// Main store for holding fetched reputation proofs, keyed by token ID.
export const proofs = writable<Map<string, ReputationProof>>(new Map());

// UI state stores
export const advance_mode = writable<boolean>(false);
export const fetch_all = writable<boolean>(true);
export const building_graph = writable<boolean | null>(null);

// Wallet and connection state stores
export const address = writable<string|null>(null);
export const network = writable<string|null>(null);
export const connected = writable<boolean>(false);

// App logic stores
export const compute_deep_level = writable<number>(5);
export const searchStore = writable<string|null>(null);
export const data_store = writable<any | null>(null);
export const types = writable<Map<string, TypeNFT>>(new Map());
export const proof_by_token_type_nft_id = writable<string>("00bd948e1bd4dc04f2237bcd7421f2367ec43032a2c8201fe1bad494f3e1a521");