import { writable } from 'svelte/store';

async function connectNautilus(): Promise<boolean> {
    if (typeof ergoConnector !== 'undefined') {
    const nautilus = ergoConnector.nautilus;
    if (nautilus) {
        if (await nautilus.connect()) {
            console.log('Connected!');
            address.set(await ergo.get_change_address());
            network.set("");
            return true;
        } else {
            alert('Not connected!');
            return false;
        }
    } else {
        alert('Nautilus Wallet is not active');
        return false;
    }
    } else {
        alert('No wallet available');
        return true;
    }
}


export const show_header = writable<boolean>(false);
export const advance_mode = writable<boolean>(false);
export const fetch_all = writable<boolean>(false);
export const address = writable<string|null>(null);
export const network = writable<string|null>(null);
export const compute_deep_level = writable<number>(5);
export const searchStore = writable<string|null>(null);
export const connected = writable<boolean>(await connectNautilus());