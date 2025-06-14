<script lang="ts">
    import type { ReputationProof, RPBox } from "$lib/ReputationProof";
    import { createEventDispatcher } from 'svelte';
    import { proofs } from "$lib/store";

    export let proof: ReputationProof;
    export let showModal: boolean;

    const dispatch = createEventDispatcher();

    // CAMBIO: La vista por defecto ahora es 'pointedBy' para que coincida con la nueva pestaña izquierda.
    let activeView: 'boxes' | 'pointedBy' = 'pointedBy';
    let activeProof: ReputationProof;

    $: if (proof) {
        activeProof = proof;
        activeView = 'pointedBy'; // Se resetea a la nueva vista por defecto.
    }
    
    let referringBoxes: { parentProof: ReputationProof, box: RPBox }[] = [];
    $: {
        if (activeProof && $proofs) {
            const currentProofId = activeProof.token_id;
            const foundBoxes: { parentProof: ReputationProof, box: RPBox }[] = [];

            for (const otherProof of $proofs.values()) {
                if (otherProof.token_id === currentProofId) continue;
                for (const box of otherProof.current_boxes) {
                    if (box.object_pointer === currentProofId) {
                        foundBoxes.push({ parentProof: otherProof, box: box });
                    }
                }
            }
            referringBoxes = foundBoxes;
        }
    }

    function closeModal() {
        showModal = false;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    function viewProofDetails(targetProofId: string) {
        if (!targetProofId) return;
        const newProof = $proofs.get(targetProofId);
        
        if (newProof) {
            activeProof = newProof;
            activeView = 'pointedBy'; // Se resetea a la nueva vista por defecto.
        }
    }

    function calculateProportion(box: RPBox, total_amount: number): string {
        if (total_amount === 0) return "0.00";
        const proportion = (box.token_amount / total_amount) * 100;
        return proportion.toFixed(2);
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if showModal && activeProof}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal-overlay" on:click|self={closeModal}>
    <article class="proof-card">
        <button class="close-button" on:click={closeModal}>&times;</button>

        <header class="proof-header">
            <div class="header-main-content">
                <h1 class="proof-title" title={activeProof.token_id}>{activeProof.token_id}</h1>
                <p class="proof-subtitle">Type: {activeProof.type.typeName}</p>
            </div>
            <span class="network-badge">{activeProof.network}</span>
        </header>

        <section class="details-section">
            <div class="details-grid">
                <strong>Owner:</strong><span class="breakable" title={activeProof.owner_address}>{activeProof.owner_address}</span>
                <strong>Description:</strong><span>{activeProof.type.description}</span>
                <strong>Total Amount:</strong><span>{activeProof.total_amount}</span>
                <strong>Schema:</strong><span class="breakable">{activeProof.type.schemaURI} (v{activeProof.type.version})</span>
            </div>
        </section>

        <div class="view-switcher">
            <button class:active={activeView === 'pointedBy'} on:click={() => activeView = 'pointedBy'}>
                Pointed By ({referringBoxes.length})
            </button>
            <button class:active={activeView === 'boxes'} on:click={() => activeView = 'boxes'}>
                Opinions ({activeProof.current_boxes.length})
            </button>
        </div>

        <div class="content-area">
            {#if activeView === 'boxes'}
                <div class="detailed-list">
                    {#if activeProof.current_boxes.length > 0}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        {#each activeProof.current_boxes as box (box.box_id)}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <div class="box-card" on:click={() => viewProofDetails(box.object_pointer)} role="button" tabindex="0">
                                <header class="box-header">
                                    <div>
                                        <h3 class="box-id" title={box.object_pointer}>{box.object_pointer}</h3>
                                        <p class="card-source-id" title={box.box_id}>Box ID: {box.box_id.substring(0, 15)}...</p>
                                    </div>
                                    <span class="polarity-badge" class:positive={box.polarization} class:negative={!box.polarization}>{box.polarization ? 'POSITIVE' : 'NEGATIVE'}</span>
                                </header>
                                <div class="details-grid">
                                    <strong>Weight:</strong><span>{box.token_amount} / {activeProof.total_amount} ({calculateProportion(box, activeProof.total_amount)}%)</span>
                                    <strong>Locked:</strong><span>{box.is_locked ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <p class="empty-state">This proof does not contain any boxes.</p>
                    {/if}
                </div>
            {:else}
                <div class="detailed-list">
                    {#if referringBoxes.length > 0}
                        {#each referringBoxes as ref (ref.box.box_id)}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <div class="box-card" on:click={() => viewProofDetails(ref.parentProof.token_id)} role="button" tabindex="0">
                                <header class="box-header">
                                    <div>
                                        <h3 class="box-id" title={ref.parentProof.token_id}>{ref.parentProof.token_id}</h3>
                                        <p class="card-source-id">Type: {ref.parentProof.type.typeName}</p>
                                    </div>
                                    <span class="polarity-badge" class:positive={ref.box.polarization} class:negative={!ref.box.polarization}>{ref.box.polarization ? 'POSITIVE' : 'NEGATIVE'}</span>
                                </header>
                                <div class="details-grid">
                                    <strong>Source Owner:</strong><span class="breakable" title={ref.parentProof.owner_address}>{ref.parentProof.owner_address}</span>
                                    <strong>Weight in Source:</strong><span>{ref.box.token_amount} / {ref.parentProof.total_amount} ({calculateProportion(ref.box, ref.parentProof.total_amount)}%)</span>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <p class="empty-state">This proof is not being pointed to by any other proofs.</p>
                    {/if}
                </div>
            {/if}
        </div>
    </article>
</div>
{/if}

<style>
    .modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.7);display:flex;justify-content:center;align-items:center;z-index:1000;padding:2rem;box-sizing:border-box}:root{--card-bg:#2a2a2a;--border-color:#444;--text-color:#e0e0e0;--text-muted:#aaa;--positive-color:#10B981;--positive-bg:rgba(4,120,87,.5);--negative-color:#EF4444;--negative-bg:rgba(153,27,27,.5);--accent-color:#FBBF24}.close-button{position:absolute;top:15px;right:20px;background:0 0;border:none;font-size:2.5rem;color:#aaa;cursor:pointer;line-height:1;z-index:10}.close-button:hover{color:#fff}
    .details-section{padding-top:1.5rem;border-top:1px solid var(--border-color)}.details-grid{display:grid;grid-template-columns:140px 1fr;gap:.75rem 1.5rem;align-items:flex-start}.details-grid strong{color:var(--text-muted);text-align:right;font-weight:400}.breakable{word-break:break-all}.view-switcher{display:flex;justify-content:center;background-color:#222;border-radius:8px;padding:4px;width:-moz-fit-content;width:fit-content;margin:2rem auto 1rem}.view-switcher button{background:0 0;border:none;color:var(--text-muted);padding:.5rem 1.5rem;border-radius:6px;cursor:pointer;font-size:1rem;font-weight:500;transition:all .2s ease-in-out}.view-switcher button.active{background-color:#444;color:#fff;font-weight:600}.detailed-list{display:flex;flex-direction:column;gap:1rem}.empty-state{color:var(--text-muted);text-align:center;padding:2rem;background-color:#262626;border-radius:8px}
    .box-card{background-color:#333;border:1px solid #555;border-radius:8px;padding:1.5rem;flex-shrink:0;transition:border-color .2s,transform .2s;cursor:pointer}.box-card:hover{border-color:var(--accent-color);transform:translateY(-2px)}.box-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.box-header>div{flex-shrink:1;min-width:0}.box-id{font-family:monospace;font-size:1.1rem;color:var(--accent-color);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .polarity-badge{font-weight:700;padding:.25rem .75rem;border-radius:15px;font-size:.9rem;flex-shrink:0}.polarity-badge.positive{background-color:var(--positive-bg);border:1px solid var(--positive-color);color:#A7F3D0}.polarity-badge.negative{background-color:var(--negative-bg);border:1px solid var(--negative-color);color:#FECACA}
    .card-source-id{font-family:monospace;color:var(--text-muted);font-size:.8rem;margin:.25rem 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    
    .proof-card {
        position: relative;
        background-color: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.5rem;
        color: var(--text-color);
        font-family: sans-serif;
        width: 100%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }
    
    .proof-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
        padding-right: 50px;
    }
    .header-main-content {
        flex-grow: 1;
        min-width: 0;
    }
    .proof-title {
        font-family: monospace;
        font-size: 1.5rem;
        color: #fff;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .proof-subtitle {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin: 0.5rem 0 0 0;
        font-weight: 500;
    }

    .network-badge{
        background-color:#333;
        padding:.3rem .8rem;
        border-radius:15px;
        font-size:.8rem;
        font-weight:700;
        border:1px solid var(--border-color);
        flex-shrink:0
    }
</style>