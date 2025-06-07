<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { searchStore } from '$lib/store';
	// --- Using the actual data fetching logic and types ---
	import { updateReputationProofList } from '$lib/unspent_proofs';
	import { ergo_tree_hash, explorer_uri } from '$lib/envs';
	import { token_rendered, type ReputationProof } from '$lib/ReputationProof';

	const dispatch = createEventDispatcher();

	let input: string = $searchStore ?? '';
	// --- The 'results' variable is now a Map to match the API response ---
	let results: Map<string, ReputationProof> = new Map();
	let isLoading = false;
	let error = '';
    let hasSearched = false; // To know when to show "no results" message

	// --- MAIN SEARCH FUNCTION ---
	async function performSearch() {
		if (!input) return;

		isLoading = true;
        hasSearched = true;
		error = '';
		results.clear(); // Clear the map before a new search

		try {
			// --- REAL API CALL ---
			// This function returns a Map, which is now correctly handled.
			results = await updateReputationProofList(
				explorer_uri,
				ergo_tree_hash,
				null, // No wallet connection needed for public search
				true, // Fetch all data related to the query
				input // The user's search term
			);
		} catch (e) {
			console.error("Search failed:", e);
			error = 'An error occurred during the search. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// --- FUNCTION TO VIEW A SPECIFIC RESULT IN THE GRAPH ---
	function viewInGraph(proof: ReputationProof) {
		// 1. Set the store to the specific token ID of the selected proof.
		// The graph component listens to this store and will re-filter.
		searchStore.set(proof.token_id);

		// 2. Dispatch the event to change the page
		dispatch('searchGraph');
	}

	// --- FUNCTION TO CLEAR EVERYTHING ---
	function clear() {
		input = '';
		results.clear(); // Use .clear() for maps
		error = '';
        hasSearched = false;
		searchStore.set(null);
	}
</script>

<div class="search-container">
	<div class="search-box">
		<h2 class="search-title">Search Reputation</h2>
		<p class="search-description">
			Enter an address, token ID, or transaction hash to find it in the graph.
		</p>
		<form class="search-form" on:submit|preventDefault={performSearch}>
			<input class="search-input" bind:value={input} placeholder="Search..." disabled={isLoading} />
			<button class="search-button" type="submit" disabled={isLoading}>Search</button>
			{#if input && !isLoading}
				<button class="clear-button" type="button" on:click={() => clear()}>❌</button>
			{/if}
		</form>
	</div>

	<!-- ============================================= -->
	<!-- ===== DYNAMIC RESULTS SECTION ===== -->
	<!-- ============================================= -->
	<div class="results-area">
		{#if isLoading}
			<div class="loader"></div>
			<p>Searching on-chain data...</p>
		{:else if error}
			<p class="error-message">{error}</p>
        <!-- --- Use .size for maps instead of .length --- -->
		{:else if results.size > 0}
			<h3 class="results-title">Search Results ({results.size})</h3>
			<ul class="results-list">
                <!-- --- Iterate over map values --- -->
				{#each Array.from(results.values()) as result (result.token_id)}
					<li class="result-item">
						<div class="result-info">
							<span class="result-type">Reputation Proof</span>
							<span class="result-id" title={result.token_id}>
								{token_rendered(result)}
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
                <p>No results found for "{input}".</p>
                <span class="no-results-hint">Please check the ID or try a different query.</span>
            </div>
		{/if}
	</div>
</div>

<style>
	.search-container {
		display: flex;
        flex-direction: column; /* Stack the search box and results */
		align-items: center;
		padding: 4rem 1rem;
        gap: 2rem; /* Space between search and results */
	}

	.search-box {
		width: 100%;
		max-width: 36em;
		padding: 2em;
		border-radius: 1em;
		background-color: #2a2a2a;
		border: 1px solid #444;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
	}

	.search-title {
		font-size: 1.75rem;
		margin: 0 0 0.5rem 0;
		color: #fbbbf24;
	}

	.search-description {
		margin: 0 0 1.5rem 0;
		color: #ccc;
		font-size: 0.95rem;
	}

	.search-form {
		display: flex;
		gap: 0.5rem;
	}

	.search-input {
		flex-grow: 1;
		padding: 0.75rem;
		font-size: 1rem;
		border-radius: 6px;
		border: 1px solid #555;
		background-color: #1a1a1a;
		color: #f0f0f0;
        transition: border-color 0.2s;
	}
    .search-input:disabled {
        background-color: #333;
        cursor: not-allowed;
    }

	.search-button,
	.clear-button {
		padding: 0 1.5rem;
		border: none;
		border-radius: 6px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.search-button {
		background-color: #fbbbf24;
		color: #1a1a1a;
	}
	.search-button:hover:not(:disabled) {
		background-color: #fde047;
	}
    .search-button:disabled {
        background-color: #555;
        cursor: not-allowed;
    }

	.clear-button {
		background-color: transparent;
		font-size: 1rem;
	}

	/* --- DYNAMIC RESULTS SECTION STYLES --- */

	.results-area {
		width: 100%;
		max-width: 36em;
        text-align: center;
	}
    
    .loader {
        margin: 1rem auto;
        border: 4px solid #555;
        border-top: 4px solid #fbbbf24;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error-message {
        color: #ef4444; /* Red for errors */
        background-color: #ef444420;
        padding: 1rem;
        border-radius: 8px;
    }

    .results-title {
        margin-bottom: 1rem;
        color: #f0f0f0;
        border-bottom: 1px solid #444;
        padding-bottom: 0.5rem;
        text-align: left;
    }

    .results-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #333;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #444;
        text-align: left;
    }

    .result-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        overflow: hidden; /* Prevent long text from overflowing */
    }
    
    .result-type {
        font-size: 0.8rem;
        font-weight: bold;
        color: #fbbbf24;
        background-color: #fbbbf2420;
        padding: 2px 6px;
        border-radius: 4px;
        align-self: flex-start;
    }

    .result-id {
        font-family: monospace;
        color: #f0f0f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis; /* Add ... if the ID is too long */
    }

    .result-snippet {
        font-size: 0.9rem;
        color: #aaa;
    }

    .view-graph-button {
        padding: 0.5rem 1rem;
        background-color: transparent;
        color: #fbbbf24;
        border: 1px solid #fbbbf24;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap; /* Prevents the text from wrapping */
        margin-left: 1rem; /* Space between info and button */
    }

    .view-graph-button:hover {
        background-color: #fbbbf24;
        color: #1a1a1a;
    }

    .no-results-box {
        background-color: #33333350;
        padding: 2rem;
        border-radius: 8px;
        border: 1px dashed #555;
    }

    .no-results-box p {
        margin: 0;
        font-size: 1.1rem;
        color: #f0f0f0;
    }

    .no-results-hint {
        color: #888;
        font-size: 0.9rem;
    }
</style>
