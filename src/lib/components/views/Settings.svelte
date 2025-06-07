<script lang="ts">
    import { Network } from "$lib/ReputationProof";
    // Removed unused store imports: show_header, advance_mode
    import { address, network, fetch_all, compute_deep_level } from "$lib/store";

    let copyButtonText = 'Copy';

    // Function to copy the address to clipboard using a fallback method
    // for compatibility with iFrame environments.
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

        <!-- Network Section -->
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
                        <option value={Network.ErgoMainnet}>Ergo Mainnet</option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- Data Fetching Section -->
        <div class="settings-section">
            <h3 class="section-title">Data & Performance</h3>
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

<style>
    .settings-container {
		display: flex;
		justify-content: center;
		padding: 4rem 1rem;
        background: #1a1a1a;
	}

	.settings-box {
		width: 100%;
		max-width: 42em; /* Slightly wider for better spacing */
		padding: 2.5em;
		border-radius: 1em;
		background-color: #252525; /* Slightly lighter than page background */
		border: 1px solid #444;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	}

    .header {
        text-align: center;
        margin-bottom: 2.5rem;
        border-bottom: 1px solid #444;
        padding-bottom: 1.5rem;
    }

    .settings-title {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		color: #fbbbf24;
        font-weight: 600;
	}

    .settings-description {
		margin: 0;
		color: #b0b0b0;
		font-size: 1rem;
	}

    .settings-section {
        margin-bottom: 2.5rem;
    }
    .settings-section:last-child {
        margin-bottom: 0;
    }

    .section-title {
        font-size: 1.25rem;
        color: #e0e0e0;
        margin-bottom: 1.5rem;
        font-weight: 500;
    }

    .setting-item {
        display: grid;
        /* CHANGE: The second column now takes only the space it needs */
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
    }

    .setting-item label {
        color: #d0d0d0;
        font-size: 0.95rem;
    }

    /* Input styling */
    .input-group {
        display: flex;
        width: 100%;
    }

    .setting-item input[type="text"],
    .setting-item select {
        font-family: monospace;
        padding: 0.75rem;
        font-size: 0.9rem;
        border: 1px solid #555;
        background-color: #1e1e1e;
        color: #f0f0f0;
        width: 100%;
    }

    .setting-item input[type="text"] {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
        border-right: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* CHANGE: Prevent cursor and selection inside the address field */
        pointer-events: none;
    }
    
    .copy-button {
        padding: 0.75rem 1rem;
        border: 1px solid #555;
        background-color: #3a3a3a;
        color: #fbbbf24;
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
    }
    .copy-button:hover {
        background-color: #4a4a4a;
    }

    .setting-item select {
        border-radius: 6px;
    }
    
    .setting-item select:disabled {
        color: #888;
        background-color: #333;
    }

    .number-input {
        padding: 0.75rem;
        font-size: 0.9rem;
        border-radius: 6px;
        border: 1px solid #555;
        background-color: #1e1e1e;
        color: #f0f0f0;
        width: 80px; /* Fixed width for number input */
        text-align: center;
        /* Align to the right of the grid cell */
        justify-self: end;
    }

    /* Custom Toggle Switch */
    .switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #555;
        transition: .3s;
        border-radius: 26px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }
    input:checked + .slider {
        background-color: #fbbbf24;
    }
    input:focus + .slider {
        box-shadow: 0 0 1px #fbbbf24;
    }
    input:checked + .slider:before {
        transform: translateX(22px);
    }
</style>