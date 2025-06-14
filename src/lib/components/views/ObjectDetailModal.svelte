<script lang="ts">
    import type { ReputationProof, RPBox } from "$lib/ReputationProof";
    import { createEventDispatcher } from 'svelte';
    import { proofs } from "$lib/store";

    // --- PROPS ---
    // Recibe un ID de objeto simple y el booleano para mostrarse
    export let objectId: string;
    export let showModal: boolean;

    const dispatch = createEventDispatcher();

    // --- LÓGICA DE DATOS ---
    // Busca todas las cajas que apuntan al objectId proporcionado
    let referringBoxes: { parentProof: ReputationProof, box: RPBox }[] = [];
    $: {
        if (objectId && $proofs) {
            const foundBoxes: { parentProof: ReputationProof, box: RPBox }[] = [];
            for (const otherProof of $proofs.values()) {
                for (const box of otherProof.current_boxes) {
                    if (box.object_pointer === objectId) {
                        foundBoxes.push({ parentProof: otherProof, box: box });
                    }
                }
            }
            referringBoxes = foundBoxes;
        } else {
            referringBoxes = [];
        }
    }

    // --- FUNCIONES DE INTERACCIÓN ---
    function closeModal() {
        showModal = false;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    // Al hacer clic en una tarjeta, despacha un evento para que el padre abra el modal de detalles
    function viewProofDetails(targetProofId: string) {
        if (!targetProofId) return;
        // Notifica al componente padre que se quiere ver una prueba específica
        dispatch('viewProof', targetProofId);
    }

    function calculateProportion(box: RPBox, total_amount: number): string {
        if (total_amount === 0) return "0.00";
        const proportion = (box.token_amount / total_amount) * 100;
        return proportion.toFixed(2);
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if showModal && objectId}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="modal-overlay" on:click|self={closeModal}>
    <article class="proof-card">
        <button class="close-button" on:click={closeModal}>&times;</button>

        <header class="proof-header">
            <div class="header-main-content">
                <p class="proof-subtitle">Opinions on Object</p>
                <h1 class="proof-title" title={objectId}>{objectId}</h1>
            </div>
        </header>

        <div class="content-area">
            <h2 class="section-title">Pointed By ({referringBoxes.length})</h2>
            <div class="detailed-list">
                {#if referringBoxes.length > 0}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#each referringBoxes as ref (ref.box.box_id)}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div class="box-card" on:click={() => viewProofDetails(ref.parentProof.token_id)} role="button" tabindex="0">
                            <header class="box-header">
                                <div>
                                    <h3 class="box-id" title={ref.parentProof.token_id}>{ref.parentProof.token_id}</h3>
                                    <p class="card-source-id">Type: {ref.parentProof.type.typeName}</p>
                                </div>
                                <span class="polarity-badge" class:positive={ref.box.polarization} class:negative={!ref.box.polarization}>
                                    {ref.box.polarization ? 'POSITIVE' : 'NEGATIVE'}
                                </span>
                            </header>
                            <div class="details-grid">
                                <strong>Source Owner:</strong><span class="breakable" title={ref.parentProof.owner_address}>{ref.parentProof.owner_address}</span>
                                <strong>Weight in Source:</strong><span>{ref.box.token_amount} / {ref.parentProof.total_amount} ({calculateProportion(ref.box, ref.parentProof.total_amount)}%)</span>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <p class="empty-state">No reputation proofs are pointing to this object.</p>
                {/if}
            </div>
        </div>
    </article>
</div>
{/if}

<style>
    /* La mayoría de los estilos son reutilizados del componente anterior */
    .modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.7);display:flex;justify-content:center;align-items:center;z-index:1000;padding:2rem;box-sizing:border-box}:root{--card-bg:#2a2a2a;--border-color:#444;--text-color:#e0e0e0;--text-muted:#aaa;--positive-color:#10B981;--positive-bg:rgba(4,120,87,.5);--negative-color:#EF4444;--negative-bg:rgba(153,27,27,.5);--accent-color:#FBBF24}.close-button{position:absolute;top:15px;right:20px;background:0 0;border:none;font-size:2.5rem;color:#aaa;cursor:pointer;line-height:1;z-index:10}.close-button:hover{color:#fff}
    .details-grid{display:grid;grid-template-columns:140px 1fr;gap:.75rem 1.5rem;align-items:flex-start}.details-grid strong{color:var(--text-muted);text-align:right;font-weight:400}.breakable{word-break:break-all}.detailed-list{display:flex;flex-direction:column;gap:1rem}.empty-state{color:var(--text-muted);text-align:center;padding:2rem;background-color:#262626;border-radius:8px}
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
        max-width: 900px;
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
        padding-bottom: 1rem;
        border-bottom: 1px solid #555;
    }
    .header-main-content {
        flex-grow: 1;
        min-width: 0;
    }
    .proof-title {
        font-family: monospace;
        font-size: 1.5rem;
        color: #fff;
        margin: 0.25rem 0 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .proof-subtitle {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin: 0;
        font-weight: 500;
    }

    .content-area {
        margin-top: 1.5rem;
    }

    .section-title {
        font-size: 1.25rem;
        color: var(--text-color);
        margin: 0 0 1rem 0;
    }
</style>