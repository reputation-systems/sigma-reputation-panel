<script lang="ts">
    import { onMount } from 'svelte';
    import { 
        explorer_uri, 
        digital_public_good_contract_hash, 
        digital_public_good_ergo_tree 
    } from '$lib/envs';
    import { hexToUtf8, SString } from '$lib/utils';
    import { SColl, SLong, SInt, SByte } from '@fleet-sdk/serializer';
    import { stringToBytes } from "@scure/base";

    
    import {
        TransactionBuilder,
        OutputBuilder,
        SAFE_MIN_BOX_VALUE,
        RECOMMENDED_MIN_FEE_VALUE,
        SConstant
    } from '@fleet-sdk/core';

    // --- Type Definition for a Type NFT ---
    interface TypeNFT {
        tokenId: string;
        boxId: string;
        typeName: string;
        description: string;
        schemaURI: string;
        version: string;
    }

    // --- Component State ---
    let types: TypeNFT[] = [];
    let isLoading = true;
    let error = '';

    // --- Form State for Creating a New Type ---
    let newTypeName = '';
    let newTypeDescription = '';
    let newTypeSchema = '';
    let newTypeVersion = '1.0.0';
    let isCreating = false;
    let creationError = '';

    // --- Fetch Existing Type NFTs from the Blockchain ---
    async function fetchTypeNfts() {
        // ... (this function remains unchanged)
        isLoading = true;
        error = '';
        types = [];
        try {
            const url = `${explorer_uri}/api/v1/boxes/unspent/search`;
            const body = { "ergoTreeTemplateHash": digital_public_good_contract_hash };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error("Failed to fetch type boxes from the explorer.");
            const data = await response.json();
            types = data.items.map((box: any): TypeNFT | null => {
                if (!box.assets || box.assets.length === 0) return null;
                return {
                    tokenId: box.assets[0].tokenId,
                    boxId: box.boxId,
                    typeName: hexToUtf8(box.additionalRegisters.R4?.renderedValue || '') ?? "",
                    description: hexToUtf8(box.additionalRegisters.R5?.renderedValue || '') ?? "",
                    schemaURI: hexToUtf8(box.additionalRegisters.R6?.renderedValue || '') ?? "",
                    version: hexToUtf8(box.additionalRegisters.R7?.renderedValue || '') ?? "",
                };
            }).filter((t: TypeNFT | null): t is TypeNFT => t !== null);
        } catch (e: any) {
            console.error("Failed to fetch types:", e);
            error = e.message || 'An error occurred while fetching types.';
        } finally {
            isLoading = false;
        }
    }

    // --- UPDATED: Handle Creation of a New Type NFT following the new pattern ---
    async function createNewType() {
        if (!newTypeName || isCreating) return;

        isCreating = true;
        creationError = '';
        
        try {
            const height = await ergo.get_current_height();
            const inputs = await ergo.get_utxos();
            const change_address = await ergo.get_change_address();

            // Use OutputBuilder for a cleaner and safer output creation
            const newTypeOutput = new OutputBuilder(
                SAFE_MIN_BOX_VALUE,
                digital_public_good_ergo_tree
            );

            // Mint the new NFT. The first input (inputs[0]) will be its token ID.
            newTypeOutput.mintToken({
                amount: 1n, // Quantity must be 1 for an NFT
                decimals: 0
            });

            // Set registers according to the agreed-upon structure
            newTypeOutput.setAdditionalRegisters({
                R4: SString(newTypeName),
                R5: SString(newTypeDescription),
                R6: SString(newTypeSchema),
                R7: SString(newTypeVersion),
            });
            
            // Build the transaction using the new, robust pattern
            const unsignedTransactionBuilder = new TransactionBuilder(height)
                .from(inputs)
                .to(newTypeOutput) // Add the constructed output
                .sendChangeTo(change_address)
                .payFee(RECOMMENDED_MIN_FEE_VALUE); // Use the recommended fee
            
            const unsignedTransaction = await unsignedTransactionBuilder.build();
            const eip12UnsignedTransaction = await unsignedTransaction.toEIP12Object();

            console.log("Requesting transaction signing for type creation...");
            const signedTransaction = await ergo.sign_tx(eip12UnsignedTransaction);
            const txId = await ergo.submit_tx(signedTransaction);

            alert(`Type NFT created successfully! Tx ID: ${txId}`);
            
            newTypeName = newTypeDescription = newTypeSchema = '';
            newTypeVersion = '1.0.0';
            await fetchTypeNfts();

        } catch (e: any) {
            console.error("Type creation failed:", e);
            creationError = e.message || "An error occurred during transaction creation.";
            if (typeof e.info === 'string') {
                creationError += `\nDetails: ${e.info}`;
            }
        } finally {
            isCreating = false;
        }
    }
    
    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        alert("Token ID copied to clipboard!");
    }

    onMount(fetchTypeNfts);
</script>

<div class="types-container">
    <div class="form-box">
        <h2 class="form-title">Create a New Type</h2>
        <p class="form-description">
            Define a new, immutable type standard for the ecosystem. This will mint a unique NFT.
        </p>
        <form class="form" on:submit|preventDefault={createNewType}>
            <div class="form-grid">
                <input class="form-input" bind:value={newTypeName} placeholder="Type Name (e.g., Web URL)" required disabled={isCreating} />
                <input class="form-input" bind:value={newTypeVersion} placeholder="Version (e.g., 1.0.0)" required disabled={isCreating} />
                <textarea class="form-input" bind:value={newTypeDescription} placeholder="Short Description..." required rows="2" disabled={isCreating}></textarea>
                <input class="form-input" bind:value={newTypeSchema} placeholder="Schema URI (optional, e.g., https://...)" disabled={isCreating} />
            </div>
            <button class="form-button" type="submit" disabled={isCreating}>
                {#if isCreating}Creating...{:else}Create Type NFT{/if}
            </button>
            {#if creationError}
                <p class="error-message">{creationError}</p>
            {/if}
        </form>
    </div>

    <div class="list-area">
        <h3 class="list-title">Existing Types ({types.length})</h3>
        {#if isLoading}
            <div class="loader"></div>
            <p>Loading on-chain types...</p>
        {:else if error}
            <p class="error-message">{error}</p>
        {:else if types.length > 0}
            <ul class="types-list">
                {#each types as type (type.tokenId)}
                    <li class="type-item">
                        <div class="type-header">
                            <span class="type-name">{type.typeName}</span>
                            <span class="type-version">v{type.version}</span>
                        </div>
                        <p class="type-description">{type.description}</p>
                        {#if type.schemaURI}
                            <p class="type-schema">Schema: <a href={type.schemaURI} target="_blank" rel="noopener noreferrer">{type.schemaURI}</a></p>
                        {/if}
                        <div class="type-footer">
                            <span class="type-id" title={type.tokenId}>ID: {type.tokenId.slice(0, 15)}...</span>
                            <button class="copy-button" on:click={() => copyToClipboard(type.tokenId)} title="Copy Token ID">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        {:else}
            <div class="no-results-box">
                <p>No types found.</p>
                <span class="no-results-hint">Be the first to create one!</span>
            </div>
        {/if}
    </div>
</div>


<style>
    /* Using a similar, but adapted, style from the Search component */
    .types-container { display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 2rem; }
    .form-box { width: 100%; max-width: 800px; padding: 2rem; border-radius: 12px; background-color: #2a2a2a; border: 1px solid #444; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }
    .form-title { font-size: 1.75rem; margin: 0 0 0.5rem 0; text-align: center; color: #FBBF24; }
    .form-description { margin: 0 0 1.5rem 0; color: #ccc; font-size: 0.95rem; text-align: center; }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    .form-grid textarea, .form-grid input:last-child {
        grid-column: 1 / -1; /* Span full width */
    }
    .form-input { width: 100%; box-sizing: border-box; padding: 0.75rem; font-size: 1rem; border-radius: 6px; border: 1px solid #666; background-color: #333; color: #f0f0f0; }
    .form-input:disabled { background-color: #444; cursor: not-allowed; }
    textarea.form-input { resize: vertical; }

    .form-button { width: 100%; padding: 0.8rem 1.5rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; background-color: #FBBF24; color: #1a1a1a; font-size: 1.1rem; }
    .form-button:disabled { background-color: #555; color: #aaa; cursor: not-allowed; }
    
    .list-area { width: 100%; max-width: 800px; text-align: center; }
    .list-title { font-size: 1.5rem; color: #f0f0f0; border-bottom: 1px solid #444; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
    .loader { margin: 1rem auto; border: 4px solid #555; border-top: 4px solid #FBBF24; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    .types-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
    .type-item { background-color: #333; padding: 1.5rem; border-radius: 8px; border: 1px solid #444; text-align: left; }
    
    .type-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; }
    .type-name { font-size: 1.25rem; font-weight: bold; color: #FBBF24; }
    .type-version { font-size: 0.9rem; color: #aaa; }
    .type-description { color: #ccc; margin: 0.5rem 0 1rem 0; font-style: italic; }
    .type-schema { font-size: 0.9rem; margin: 0.5rem 0 1rem 0; }
    .type-schema a { color: #FBBF24; text-decoration: none; }
    .type-schema a:hover { text-decoration: underline; }

    .type-footer { display: flex; justify-content: space-between; align-items: center; background-color: #2a2a2a; padding: 0.5rem 1rem; margin: 1rem -1.5rem -1.5rem -1.5rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border-top: 1px solid #444; }
    .type-id { font-family: monospace; font-size: 0.85rem; color: #aaa; }
    .copy-button { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1rem; }
    .copy-button:hover { color: #FBBF24; }

    .error-message { color: #ff6b6b; background-color: rgba(255, 107, 107, 0.1); border: 1px solid #ff6b6b; padding: 0.75rem; border-radius: 6px; }
    .no-results-box { padding: 2rem; background-color: #2a2a2a; border-radius: 8px; }
</style>