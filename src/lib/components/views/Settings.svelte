<script lang="ts">
    import { address, network, fetch_all, compute_deep_level, proof_by_token_type_nft_id, types } from "$lib/store";

    export interface TypeNFT {
        tokenId: string;
        boxId: string;
        typeName:string;
        description: string;
        schemaURI: string;
        version: string;
    }

    let showConfirmationModal = false;
    let changeDetails: { fromType: TypeNFT | null, toType: TypeNFT | null, toValue: string } | null = null;
    let acknowledgementChecked = false;
    
    let selectedValue = $proof_by_token_type_nft_id;

    function handleSelectionChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const newSelectedValue = target.value;

        if (newSelectedValue === $proof_by_token_type_nft_id) {
            return;
        }

        changeDetails = {
            fromType: $types.get($proof_by_token_type_nft_id) || null,
            toType: $types.get(newSelectedValue) || null,
            toValue: newSelectedValue
        };
        
        acknowledgementChecked = false;
        showConfirmationModal = true;
    }

    function handleConfirmChange() {
        if (changeDetails && acknowledgementChecked) {
            $proof_by_token_type_nft_id = changeDetails.toValue;
        }
        closeModal();
    }

    function handleCancelChange() {
        selectedValue = $proof_by_token_type_nft_id;
        closeModal();
    }

    function closeModal() {
        showConfirmationModal = false;
        changeDetails = null;
    }

    $: if (!showConfirmationModal) {
        selectedValue = $proof_by_token_type_nft_id;
    }

    let copyButtonText = 'Copy';
    function copyAddress() {
        const textToCopy = $address;
        const textArea = document.createElement('textarea');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            copyButtonText = 'Copied!';
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            copyButtonText = 'Failed!';
        }
        document.body.removeChild(textArea);

        setTimeout(() => {
            copyButtonText = 'Copy';
        }, 2000);
    }
</script>

<div class="settings-container">
    <div class="settings-box">
        <div class="header">
            <h2 class="settings-title">Settings</h2>
            <p class="settings-description">Manage network settings and application preferences.</p>
        </div>

        <div class="settings-section">
            <h3 class="section-title">Network Configuration</h3>
            <div class="setting-item">
                <label for="address-display">Your Address</label>
                <div class="input-group">
                    <input id="address-display" type="text" readonly value={$address} title={$address} />
                    <button class="copy-button" on:click={copyAddress}>{copyButtonText}</button>
                </div>
            </div>
            <div class="setting-item">
                <label for="network-select">Current Network</label>
                 <div class="input-group">
                    <select id="network-select" disabled bind:value={$network}>
                        <option value={"ergo"}>Ergo Mainnet</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3 class="section-title">Data & Performance</h3>
            
            <div class="setting-item">
                <label for="type-select" title="Select the specific token type to be used for proofs.">
                    Proof Token Type
                </label>
                <div class="input-group">
                    <select id="type-select" bind:value={selectedValue} on:change={handleSelectionChange}>
                        <option value={""} title="Do not filter proofs by a specific token type.">
                            None / Default
                        </option>
                        {#each $types as [id, type]}
                            <option value={type.tokenId} title={type.description}>
                                {type.typeName} (v{type.version})
                            </option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="setting-item">
                <label for="fetch-all-check" title="Load all proofs from the entire network on startup. May be slow.">
                    Fetch all network proofs
                </label>
                <label class="switch">
                    <input id="fetch-all-check" type="checkbox" bind:checked={$fetch_all} />
                    <span class="slider"></span>
                </label>
            </div>
             <div class="setting-item">
                <label for="deep-level-input" title="Sets how many levels deep the graph calculation will go. Higher values are more accurate but slower.">
                    Graph Compute Depth
                </label>
                <input id="deep-level-input" class="number-input" type="number" min="0" max="10" bind:value={$compute_deep_level} />
            </div>
        </div>
    </div>
</div>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if showConfirmationModal && changeDetails}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-backdrop" on:click={handleCancelChange}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header warning">
                <h3>Warning: Critical Action</h3>
                <button class="modal-close" on:click={handleCancelChange}>&times;</button>
            </div>
            <div class="modal-body">
                <p>You are about to change the ID for the 'Reputation Proof' type.</p>
                <p class="consequence">
                    <strong>Consequence:</strong> This action will recalculate the entire visual structure of the graph. Connections and appearance may change drastically.
                </p>
                <div class="change-info">
                    <div class="change-from">
                        <strong>Current ID:</strong>
                        <span>{changeDetails.fromType?.typeName || 'None'}</span>
                    </div>
                    <div class="change-arrow">→</div>
                    <div class="change-to">
                        <strong>New ID:</strong>
                        <span>{changeDetails.toType?.typeName || 'None'}</span>
                    </div>
                </div>

                <div class="acknowledgement-box">
                    <input type="checkbox" id="ack-checkbox" bind:checked={acknowledgementChecked}>
                    <label for="ack-checkbox">I understand the consequences and wish to change the graph structure.</label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-button cancel" on:click={handleCancelChange}>Cancel</button>
                <button 
                    class="modal-button confirm" 
                    on:click={handleConfirmChange} 
                    disabled={!acknowledgementChecked}
                >
                    Confirm Change
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .settings-container { display: flex; justify-content: center; padding: 2rem 1rem; }
    .settings-box { width: 100%; max-width: 700px; padding: 2rem; border-radius: 12px; background-color: #2a2a2a; border: 1px solid #444; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); }
    .header { text-align: center; margin-bottom: 2rem; border-bottom: 1px solid #444; padding-bottom: 1.5rem; }
    .settings-title { font-size: 2rem; margin: 0 0 0.5rem 0; color: #FBBF24; font-weight: 600; }
    .settings-description { margin: 0; color: #b0b0b0; font-size: 1rem; }
    .settings-section { margin-bottom: 2.5rem; }
    .settings-section:last-child { margin-bottom: 0; }
    .setting-item { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 1.5rem; padding: 1rem 0; border-bottom: 1px solid #444; }
    .settings-section .setting-item:last-child { border-bottom: none; }
    .setting-item input[type="text"], .setting-item select { padding: 0.75rem; font-size: 0.9rem; border: 1px solid #666; background-color: #333; color: #f0f0f0; width: 100%; border-radius: 6px; }
    .copy-button { padding: 0.75rem 1rem; border: 1px solid #FBBF24; border-left: none; background-color: #FBBF24; color: #2a2a2a; border-top-right-radius: 6px; border-bottom-right-radius: 6px; cursor: pointer; font-weight: bold; transition: background-color 0.2s, border-color 0.2s; }
    .copy-button:hover { background-color: #fde047; border-color: #fde047;}
    .input-group { display: flex; width: 100%; }
    .input-group input[type="text"] { border-top-right-radius: 0; border-bottom-right-radius: 0; }
    .switch { position: relative; display: inline-block; width: 48px; height: 26px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #555; transition: .3s; border-radius: 26px; }
    .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .slider { background-color: #FBBF24; }
    input:focus + .slider { box-shadow: 0 0 2px #FBBF24; }
    input:checked + .slider:before { transform: translateX(22px); }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        background-color: #2a2a2a;
        color: #f0f0f0;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        border: 1px solid #444;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #444;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }
    .modal-header.warning {
        border-bottom-color: #D97706;
    }
    .modal-header.warning h3 {
        color: #FBBF24;
    }
    .modal-close {
        background: none;
        border: none;
        font-size: 2rem;
        color: #888;
        cursor: pointer;
        line-height: 1;
    }
    .modal-close:hover {
        color: #fff;
    }
    .modal-body .consequence {
        font-size: 0.95rem;
        background-color: rgba(217, 119, 6, 0.1);
        border-left: 4px solid #D97706;
        padding: 0.75rem 1rem;
        color: #f0f0f0;
        border-radius: 4px;
        margin-top: 0.5rem;
    }
    .modal-body .change-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background-color: #333;
        padding: 1rem;
        border-radius: 8px;
        margin: 1.5rem 0;
    }
    .change-info strong {
        color: #aaa;
        display: block;
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
    }
    .change-info span {
        font-weight: bold;
        background-color: #444;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        min-width: 80px;
        text-align: center;
        display: inline-block;
    }
    .change-arrow {
        font-size: 2rem;
        color: #FBBF24;
    }
    .acknowledgement-box {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #333;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .acknowledgement-box input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #FBBF24;
        cursor: pointer;
    }
    .acknowledgement-box label {
        color: #ccc;
        font-size: 0.9rem;
        user-select: none;
        cursor: pointer;
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    .modal-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
    }
    .modal-button.cancel {
        background-color: #555;
        color: #fff;
    }
    .modal-button.cancel:hover {
        background-color: #666;
    }
    .modal-button.confirm {
        background-color: #FBBF24;
        color: #2a2a2a;
    }
    .modal-button.confirm:hover {
        background-color: #fde047;
    }
    .modal-button.confirm:disabled {
        background-color: #555;
        color: #888;
        cursor: not-allowed;
    }
    .modal-button.confirm:disabled:hover {
        background-color: #555;
    }
</style>