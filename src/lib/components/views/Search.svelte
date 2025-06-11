<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { searchStore, types } from '$lib/store';
    import { updateReputationProofList, fetchTypeNfts } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';
    import { token_rendered, type ReputationProof, type TypeNFT } from '$lib/ReputationProof';

    const dispatch = createEventDispatcher();

    // --- Search State ---
    let searchMode: 'text' | 'type' = 'text';
    let textInput: string = $searchStore ?? '';
    let selectedTypeId: string = '';
    
    let results: Map<string, ReputationProof> = new Map();
    let isLoading = false;
    let isTypesLoading = true;
    let error = '';
    let hasSearched = false;

    onMount(async () => {
        isTypesLoading = true;
        await fetchTypeNfts();
        isTypesLoading = false;
    });

    async function performSearch() {
        if (searchMode === 'text' && !textInput) return;
        if (searchMode === 'type' && !selectedTypeId) return;

        isLoading = true;
        hasSearched = true;
        error = '';
        results.clear();

        try {
            if (searchMode === 'text') {
                results = await updateReputationProofList(null, true, textInput, undefined);
            } else { // searchMode === 'type'
                // The API call seems to ignore the type_id filter when no search_term is provided.
                // As a workaround, we will fetch the data and then filter it client-side to ensure correctness.
                const proofsFromApi = await updateReputationProofList(null, true, undefined, selectedTypeId);
                
                const filteredResults = new Map<string, ReputationProof>();
                for (const [key, proof] of proofsFromApi.entries()) {
                    // Manually filter by the selected type's tokenId.
                    if (proof.type.tokenId === selectedTypeId) {
                        filteredResults.set(key, proof);
                    }
                }
                results = filteredResults;
            }
        } catch (e) {
            console.error("Search failed:", e);
            error = 'An error occurred during the search. Please try again.';
        } finally {
            isLoading = false;
        }
    }

    function viewInGraph(proof: ReputationProof) {
        searchStore.set(proof.token_id);
        dispatch('searchGraph');
    }

    function clear() {
        textInput = '';
        selectedTypeId = '';
        results.clear();
        error = '';
        hasSearched = false;
        searchStore.set(null);
    }

    // Helper for dynamic messages
    $: currentQuery = searchMode === 'text' ? textInput : $types.get(selectedTypeId)?.typeName;
</script>

<div class="search-container">
    <div class="search-box">
        <h2 class="search-title">Search Reputation</h2>
        <p class="search-description">
            Find proofs by text/ID, or browse all proofs of a specific type.
        </p>
        <form class="search-form" on:submit|preventDefault={performSearch}>
            <div class="search-mode-selector">
                 <select bind:value={searchMode} class="search-input mode-select" title="Select search mode">
                    <option value="text">By Text/ID</option>
                    <option value="type">By Proof Type</option>
                </select>
            </div>

            <div class="search-input-area">
                {#if searchMode === 'text'}
                    <input class="search-input" bind:value={textInput} placeholder="Address, token ID, transaction hash..." disabled={isLoading} />
                {:else}
                    <select class="search-input" bind:value={selectedTypeId} disabled={isLoading || isTypesLoading} required>
                        <option value="" disabled>
                            {#if isTypesLoading}Loading types...{:else}-- Select a proof type --{/if}
                        </option>
                        {#if !isTypesLoading}
                            {#each Array.from($types.values()) as type (type.tokenId)}
                                <option value={type.tokenId}>
                                    {type.typeName} (v{type.version})
                                </option>
                            {/each}
                        {/if}
                    </select>
                {/if}
            </div>
            
            <button class="search-button" type="submit" disabled={isLoading}>Search</button>
            {#if (textInput || selectedTypeId) && !isLoading}
                <button class="clear-button" type="button" on:click={clear}>❌</button>
            {/if}
        </form>
    </div>

    <div class="results-area">
        {#if isLoading}
            <div class="loader"></div>
            <p>Searching on-chain data...</p>
        {:else if error}
            <p class="error-message">{error}</p>
        {:else if results.size > 0}
            <h3 class="results-title">Search Results ({results.size})</h3>
            <ul class="results-list">
                {#each Array.from(results.values()) as result (result.token_id)}
                    <li class="result-item">
                        <div class="result-info">
                            <span class="result-type">{result.type.typeName}</span>
                            <span class="result-id" title={result.token_id}>
                                {result.token_id}
                            </span>
                            <span class="result-snippet">
                                Total amount: {result.total_amount}
                            </span>
                        </div>
                        <button class="view-graph-button" on:click={() => viewInGraph(result)}>
                            View in graph
                        </button>
                    </li>
                {/each}
            </ul>
        {:else if hasSearched}
            <div class="no-results-box">
                <p>No results found for "{currentQuery}".</p>
                <span class="no-results-hint">Please check your selection or try a different query.</span>
            </div>
        {/if}
    </div>
</div>

<style>
.search-container { display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 2rem; }
.search-box { width: 100%; max-width: 1400px; padding: 2rem; border-radius: 12px; background-color: #2a2a2a; border: 1px solid #444; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }
.search-title { font-size: 1.75rem; margin: 0 0 0.5rem 0; text-align: center; color: #FBBF24; }
.search-description { margin: 0 0 1.5rem 0; color: #ccc; font-size: 0.95rem; text-align: center; }

.search-form {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    align-items: center;
}

.search-mode-selector {
    flex-shrink: 0;
}

.search-input-area {
    flex-grow: 1;
}

.search-input { width: 100%; padding: 0.75rem; font-size: 1rem; border-radius: 6px; border: 1px solid #666; background-color: #333; color: #f0f0f0; transition: border-color 0.2s; box-sizing: border-box; }
.search-input.mode-select {
    width: auto;
    padding-right: 2rem;
}
.search-input:disabled { background-color: #444; cursor: not-allowed; }

.search-button, .clear-button { padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background-color 0.2s; flex-shrink: 0; }
.search-button { background-color: #FBBF24; color: #2a2a2a; }
.search-button:hover:not(:disabled) { background-color: #fde047; }
.search-button:disabled { background-color: #555; color: #aaa; cursor: not-allowed; }
.clear-button { background: none; color: #aaa; padding: 0.75rem; font-size: 0.8rem; }
.clear-button:hover { color: white; }

.results-area { width: 100%; max-width: 1400px; text-align: center; }
.loader { margin: 1rem auto; border: 4px solid #555; border-top: 4px solid #FBBF24; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.results-title { color: #ccc; font-weight: normal; border-bottom: 1px solid #444; padding-bottom: 1rem; margin-bottom: 2rem; }
.results-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.result-item { 
    display: flex; 
    flex-direction: column; 
    gap: 0.75rem;
    background-color: #333; 
    padding: 1rem; 
    border-radius: 8px; 
    border: 1px solid #444; 
    text-align: left; 
}
.result-info { display: flex; flex-direction: column; gap: 0.5rem; }
.result-type { font-size: 0.8rem; font-weight: bold; color: #FBBF24; background-color: rgba(251, 191, 36, 0.15); padding: 2px 6px; border-radius: 4px; align-self: flex-start; }
.result-id { font-family: monospace; color: #f0f0f0; word-break: break-all;}
.result-snippet { color: #aaa; font-size: 0.9rem; }
.view-graph-button { 
    margin-top: 1rem; 
    padding: 0.5rem 1rem; 
    background-color: transparent; 
    color: #FBBF24; 
    border: 1px solid #FBBF24; 
    border-radius: 6px; 
    cursor: pointer; 
    transition: all 0.2s; 
    white-space: nowrap; 
    margin-left: auto;
}
.view-graph-button:hover { background-color: rgba(251, 191, 36, 0.1); }
.no-results-box { background-color: #333; border: 1px solid #444; border-radius: 8px; padding: 2rem; margin-top: 1rem; }
.no-results-box p { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: white; }
.no-results-box span { color: #aaa; }

/* --- CSS FIX --- */
/* On screens 640px and wider (small screens), change the layout of result items */
@media (min-width: 640px) {
    .result-item {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .view-graph-button {
        margin-top: 0;
    }
}
</style>
