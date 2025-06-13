<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { searchStore, types } from '$lib/store';
    import { updateReputationProofList, fetchTypeNfts } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';
    import { token_rendered, type ReputationProof, type RPBox, type TypeNFT } from '$lib/ReputationProof';
    import { renderedToString } from '$lib/utils';

    const dispatch = createEventDispatcher();

    // --- INTERFAZ PARA EL CARRUSEL ---
    interface OpinionDetail {
        parentProof: ReputationProof;
        box: RPBox;
        proportion: number;
    }

    // --- Search State ---
    let searchMode: 'text' | 'type' | 'target' = 'text';
    let textInput: string = $searchStore ?? '';
    let selectedTypeId: string = '';
    
    let results: Map<string, ReputationProof> = new Map();
    let isLoading = false;
    let isTypesLoading = true;
    let error = '';
    let hasSearched = false;

    // --- Carousel State ---
    let opinions: OpinionDetail[] = [];
    let currentOpinionIndex = 0;

    // --- UI State ---
    let expandedDetails = new Set<string>();

    onMount(async () => {
        isTypesLoading = true;
        await fetchTypeNfts();
        isTypesLoading = false;
    });

    async function performSearch() {
        if ((searchMode === 'text' || searchMode === 'target') && !textInput) return;
        if (searchMode === 'type' && !selectedTypeId) return;

        isLoading = true;
        hasSearched = true;
        error = '';
        results.clear();
        opinions = []; // Limpiar opiniones anteriores
        currentOpinionIndex = 0;
        expandedDetails.clear();

        try {
            if (searchMode === 'text') {
                results = await updateReputationProofList(null, true, textInput, undefined);
            } else if (searchMode === 'type') {
                const proofsFromApi = await updateReputationProofList(null, true, undefined, selectedTypeId);
                const filteredResults = new Map<string, ReputationProof>();
                for (const [key, proof] of proofsFromApi.entries()) {
                    if (proof.type.tokenId === selectedTypeId) {
                        filteredResults.set(key, proof);
                    }
                }
                results = filteredResults;
            } else { // searchMode === 'target'
                const allProofs = await updateReputationProofList(null, true, undefined, undefined);
                const targetId = textInput.trim();
                const relevantOpinions: OpinionDetail[] = [];

                for (const proof of allProofs.values()) {
                    for (const box of proof.current_boxes) {
                        // Comprobamos si la caja apunta al objeto buscado
                        if (box.object_pointer === targetId) {
                            // Si apunta, creamos un objeto 'OpinionDetail'
                            relevantOpinions.push({
                                parentProof: proof,
                                box: box,
                                proportion: box.token_amount / proof.total_amount,
                            });
                        }
                    }
                }
                opinions = relevantOpinions;
            }
        } catch (e) {
            console.error("Search failed:", e);
            error = 'An error occurred during the search. Please try again.';
        } finally {
            isLoading = false;
        }
    }

    // --- Funciones del Carrusel ---
    function showNextOpinion() {
        if (opinions.length > 1) {
            currentOpinionIndex = (currentOpinionIndex + 1) % opinions.length;
        }
    }

    function showPreviousOpinion() {
        if (opinions.length > 1) {
            currentOpinionIndex = (currentOpinionIndex - 1 + opinions.length) % opinions.length;
        }
    }

    // --- Helpers ---
    function clear() {
        textInput = '';
        selectedTypeId = '';
        results.clear();
        opinions = [];
        error = '';
        hasSearched = false;
        searchStore.set(null);
        expandedDetails.clear();
    }
    
    $: currentOpinion = opinions[currentOpinionIndex] as OpinionDetail | undefined;
    $: currentQuery = searchMode === 'text' || searchMode === 'target' ? textInput : $types.get(selectedTypeId)?.typeName;
    $: inputPlaceholder = searchMode === 'target' ? 'Object Pointer ID (e.g., a token ID)...' : 'Address, token ID, transaction hash...';

</script>

<div class="search-container">
    <div class="search-box">
        </div>

    <div class="results-area">
        {#if isLoading}
            <div class="loader"></div>
            <p>Searching on-chain data...</p>
        {:else if error}
            <p class="error-message">{error}</p>
        
        {:else if hasSearched && searchMode === 'target'}
            {#if opinions.length > 0}
                <div class="carousel-view">
                    <div class="carousel-header">
                        <h3 class="results-title">Opinions on object: <span class="highlight-text td-breakable">{textInput}</span></h3>
                        <span class="carousel-counter">{currentOpinionIndex + 1} / {opinions.length}</span>
                    </div>

                    <div class="carousel-content">
                        <button class="carousel-nav-button" on:click={showPreviousOpinion} disabled={opinions.length <= 1}>
                            &lt;
                        </button>
                        
                        {#if currentOpinion}
                        <div class="opinion-card">
                            <div class="opinion-header">
                                <span class="result-type">{currentOpinion.parentProof.type.typeName}</span>
                                <span class="opinion-polarity" class:negative={currentOpinion.box.polarization === false}>
                                    {currentOpinion.box.polarization ? 'POSITIVE' : 'NEGATIVE'}
                                </span>
                            </div>

                            <div class="opinion-details-grid">
                                <strong>Weight:</strong>
                                <span>{(currentOpinion.proportion * 100).toFixed(2)}%</span>

                                <strong>Source Proof:</strong>
                                <span class="td-breakable" title={currentOpinion.parentProof.token_id}>{token_rendered(currentOpinion.parentProof)}</span>

                                <strong>Owner:</strong>
                                <span class="td-breakable" title={currentOpinion.parentProof.owner_address}>{currentOpinion.parentProof.owner_address}</span>
                                
                                <strong>Source Box ID:</strong>
                                <span class="td-breakable" title={currentOpinion.box.box_id}>{currentOpinion.box.box_id}</span>
                            </div>

                            {#if currentOpinion.box.content && Object.keys(currentOpinion.box.content).length > 0}
                                <div class="opinion-box-content">
                                    <h4>Box Content (R8)</h4>
                                    <pre><code>{JSON.stringify(currentOpinion.box.content, null, 2)}</code></pre>
                                </div>
                            {/if}
                        </div>
                        {/if}

                        <button class="carousel-nav-button" on:click={showNextOpinion} disabled={opinions.length <= 1}>
                            &gt;
                        </button>
                    </div>
                </div>
            {:else}
                <div class="no-results-box">
                    <p>No opinions found for object "{currentQuery}".</p>
                    <span class="no-results-hint">This object is not pointed to by any reputation proof.</span>
                </div>
            {/if}

        {:else if results.size > 0}
            <h3 class="results-title">Search Results ({results.size})</h3>
            <ul class="results-list">
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
/* --- ESTILOS GENERALES Y DE RESULTADOS (SIN CAMBIOS) --- */
/* ... Se mantienen todos los estilos anteriores ... */

/* --- NUEVOS ESTILOS PARA EL CARRUSEL --- */
.carousel-view {
    width: 100%;
    max-width: 900px; /* Ancho máximo del carrusel */
    margin: 0 auto;
    padding: 1rem;
    background-color: #2a2a2a;
    border: 1px solid #444;
    border-radius: 12px;
}

.carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #444;
}
.carousel-header .results-title {
    margin: 0;
    padding: 0;
    border: none;
    text-align: left;
}
.highlight-text {
    color: #FBBF24;
    font-family: monospace;
}

.carousel-counter {
    font-size: 0.9rem;
    background-color: #333;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    color: #ccc;
}

.carousel-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.carousel-nav-button {
    background: transparent;
    border: 1px solid #666;
    color: #ccc;
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.carousel-nav-button:hover:not(:disabled) {
    background-color: #444;
    border-color: #888;
}
.carousel-nav-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.opinion-card {
    background-color: #333;
    border-radius: 8px;
    border: 1px solid #555;
    padding: 1.5rem;
    text-align: left;
    width: 100%;
    flex-grow: 1;
}

.opinion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
}
.opinion-polarity {
    font-weight: bold;
    font-size: 0.9rem;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    background-color: rgba(4, 120, 87, 0.5); /* Verde por defecto (Positivo) */
    border: 1px solid #10B981;
    color: #A7F3D0;
}
.opinion-polarity.negative {
    background-color: rgba(153, 27, 27, 0.5); /* Rojo para Negativo */
    border-color: #EF4444;
    color: #FECACA;
}

.opinion-details-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    font-size: 0.95rem;
    align-items: center;
}
.opinion-details-grid strong {
    color: #aaa;
    font-weight: normal;
    text-align: right;
}
.opinion-details-grid span {
    color: #f0f0f0;
}

.opinion-box-content {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #444;
}
.opinion-box-content h4 {
    margin: 0 0 1rem 0;
    color: #FBBF24;
    font-size: 1rem;
}
.opinion-box-content pre {
    background-color: #222;
    padding: 1rem;
    border-radius: 6px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 250px;
    overflow-y: auto;
}

.td-breakable {
    white-space: pre-wrap;
    word-break: break-all;
}
</style>