<script lang="ts">
    import type { ReputationProof, RPBox } from "$lib/ReputationProof";
    import { createEventDispatcher, onMount } from 'svelte';
    import { proofs } from "$lib/store";
    import { get } from 'svelte/store';

    export let proof: ReputationProof;
    export let showModal: boolean;

    const dispatch = createEventDispatcher();

    let activeView: 'boxes' | 'pointedBy' = 'pointedBy';
    let activeProof: ReputationProof;

    $: if (proof) {
        activeProof = proof;
        activeView = 'pointedBy';
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
        dispatch('close');
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
            activeView = 'pointedBy';
        }
    }

    function handleOpinionClick(box: RPBox) {
        if (!box.object_pointer) return;
        const isProofPointer = box.type.isRepProof;

        if (isProofPointer && $proofs.has(box.object_pointer)) {
            viewProofDetails(box.object_pointer);
        } else if (!isProofPointer) {
            dispatch('viewObject', { objectId: box.object_pointer });
        }
    }

    function calculateProportion(box: RPBox, total_amount: number): string {
        if (total_amount === 0) return "0.00";
        const proportion = (box.token_amount / total_amount) * 100;
        return proportion.toFixed(2);
    }
    
    // --- Lógica para renderizado inteligente del contenido ---
    function isLikelyMarkdown(text: string): boolean {
        const markdownPattern = /(^#{1,6}\s)|(\*\*|__)|(\*|-|\+)\s|(\[.*\]\(.*\))/;
        return markdownPattern.test(text);
    }

    onMount(() => {
        if (!window.marked) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
            document.head.appendChild(script);
        }
    });

</script>

<svelte:window on:keydown={handleKeydown}/>

{#if showModal && activeProof}
<!-- svelte-ignore a11y-click-events-have-key-events, a11y-no-static-element-interactions -->
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
                <strong>Schema:</strong><span class="breakable">{activeProof.type.schemaURI}</span>
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
                <!-- Pestaña de Opiniones Emitidas -->
                <div class="detailed-list">
                    {#if activeProof.current_boxes.length > 0}
                        {#each activeProof.current_boxes as box (box.box_id)}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <div class="box-card" on:click={() => handleOpinionClick(box)} role="button" tabindex="0">
                                <header class="box-header">
                                    <div>
                                        <h3 class="box-id" title={box.object_pointer}>{box.object_pointer}</h3>
                                        <p class="card-source-id" title={box.box_id}>Box ID: {box.box_id.substring(0, 15)}...</p>
                                        <p class="card-source-id" title={box.box_id}>Type: {box.type.typeName}</p>
                                    </div>
                                    <span class="polarity-badge" class:positive={box.polarization} class:negative={!box.polarization}>{box.polarization ? 'POSITIVE' : 'NEGATIVE'}</span>
                                </header>
                                <div class="details-grid">
                                    <strong>Weight:</strong><span>{box.token_amount} / {activeProof.total_amount} ({calculateProportion(box, activeProof.total_amount)}%)</span>
                                    <strong>Locked:</strong><span>{box.is_locked ? 'Yes' : 'No'}</span>
                                </div>
                                <div class="content-section">
                                    {#if typeof box.content === 'object' && box.content !== null && Object.keys(box.content).length > 0}
                                        <pre class="code-font">{JSON.stringify(box.content, null, 2)}</pre>
                                    {:else if typeof box.content === 'string' && box.content.trim() !== ''}
                                        {#if isLikelyMarkdown(box.content) && window.marked}
                                            <div class="markdown-content">{@html window.marked.parse(box.content)}</div>
                                        {:else}
                                            <p class="plain-text-content">{box.content}</p>
                                        {/if}
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <p class="empty-state">This proof does not contain any boxes.</p>
                    {/if}
                </div>
            {:else}
                <!-- Pestaña de Opiniones Recibidas -->
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
                                    <span class="polarity-badge" class:positive={ref.box.polarization} class:negative={!ref.box.polarization}>{ref.box.polarization ? 'POSITIVE' : 'NEGATIVE'}</span>
                                </header>
                                <div class="details-grid">
                                    <strong>Source Owner:</strong><span class="breakable" title={ref.parentProof.owner_address}>{ref.parentProof.owner_address}</span>
                                    <strong>Weight in Source:</strong><span>{ref.box.token_amount} / {ref.parentProof.total_amount} ({calculateProportion(ref.box, ref.parentProof.total_amount)}%)</span>
                                </div>
                                <div class="content-section">
                                     {#if typeof ref.box.content === 'object' && ref.box.content !== null && Object.keys(ref.box.content).length > 0}
                                        <pre class="code-font">{JSON.stringify(ref.box.content, null, 2)}</pre>
                                    {:else if typeof ref.box.content === 'string' && ref.box.content.trim() !== ''}
                                        {#if isLikelyMarkdown(ref.box.content) && window.marked}
                                            <div class="markdown-content">{@html window.marked.parse(ref.box.content)}</div>
                                        {:else}
                                            <p class="plain-text-content">{ref.box.content}</p>
                                        {/if}
                                    {/if}
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
    .modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.7);display:flex;justify-content:center;align-items:center;z-index:1000;padding:2rem;box-sizing:border-box}
    .proof-card{position:relative;background-color:#2a2a2a;border:1px solid #444;border-radius:12px;padding:2rem;color:#e0e0e0;font-family:sans-serif;width:100%;max-width:800px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column}
    .close-button{position:absolute;top:15px;right:20px;background:0 0;border:none;font-size:2.5rem;color:#aaa;cursor:pointer;line-height:1;z-index:10}
    .close-button:hover{color:#fff}
    .proof-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1.5rem;padding-right:50px}
    .header-main-content{flex-grow:1;min-width:0}
    .proof-title{font-family:monospace;font-size:1.5rem;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .proof-subtitle{color:#aaa;font-size:.9rem;margin:.5rem 0 0;font-weight:500}
    .network-badge{background-color:#333;padding:.3rem .8rem;border-radius:15px;font-size:.8rem;font-weight:700;border:1px solid #444;flex-shrink:0}
    .details-section{padding-top:1.5rem;border-top:1px solid #444;margin-bottom: 1rem;}
    .details-grid{display:grid;grid-template-columns:140px 1fr;gap:.75rem 1.5rem;align-items:center}
    .details-grid strong{color:#aaa;text-align:right;font-weight:400}
    .breakable{word-break:break-all}
    .view-switcher{display:flex;justify-content:center;background-color:#222;border-radius:8px;padding:4px;width:-moz-fit-content;width:fit-content;margin:1rem auto}
    .view-switcher button{background:0 0;border:none;color:#aaa;padding:.5rem 1.5rem;border-radius:6px;cursor:pointer;font-size:1rem;font-weight:500;transition:all .2s ease-in-out}
    .view-switcher button.active{background-color:#444;color:#fff;font-weight:600}
    .content-area{overflow-y:auto;padding-top:1rem;border-top:1px solid #444;margin-top:1rem;}
    .detailed-list{display:flex;flex-direction:column;gap:1rem}
    .empty-state{color:#aaa;text-align:center;padding:2rem;background-color:#262626;border-radius:8px}
    .box-card{background-color:#333;border:1px solid #555;border-radius:8px;padding:1.5rem;flex-shrink:0;transition:border-color .2s,transform .2s;cursor:pointer}
    .box-card:hover{border-color:#FBBF24;transform:translateY(-2px)}
    .box-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
    .box-header>div{flex-shrink:1;min-width:0}
    .box-id{font-family:monospace;font-size:1.1rem;color:#FBBF24;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .card-source-id{font-family:monospace;color:#aaa;font-size:.8rem;margin:.25rem 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .polarity-badge{font-weight:700;padding:.25rem .75rem;border-radius:15px;font-size:.9rem;flex-shrink:0}
    .polarity-badge.positive{background-color:rgba(4,120,87,.5);border:1px solid #10B981;color:#A7F3D0}
    .polarity-badge.negative{background-color:rgba(153,27,27,.5);border:1px solid #EF4444;color:#FECACA}
    .content-section{margin-top:1rem;padding-top:1rem;border-top:1px solid #444}
    .plain-text-content{white-space:pre-wrap}
    .code-font,pre{font-family:'Courier New',Courier,monospace;background-color:#222;padding:.75rem;border-radius:4px;font-size:.9em;word-break:break-all;white-space:pre-wrap}
    .markdown-content :global(h1),.markdown-content :global(h2),.markdown-content :global(h3){color:#FBBF24;border-bottom:1px solid #555;padding-bottom:.3em}
    .markdown-content :global(p){line-height:1.6}
    .markdown-content :global(a){color:#6ebff5}
    .markdown-content :global(ul),.markdown-content :global(ol){padding-left:2em}
    .markdown-content :global(li){margin-bottom:.5rem}
    .markdown-content :global(blockquote){border-left:4px solid #444;padding-left:1em;margin-left:0;color:#aaa}
    .markdown-content :global(code){background-color:#3a3a3c;padding:.2em .4em;border-radius:4px;font-family:'Courier New',Courier,monospace}
</style>
