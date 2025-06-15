<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { proofs } from '$lib/store';
  import type { ReputationProof, RPBox } from '$lib/ReputationProof';

  export let objectId: string | null;

  const dispatch = createEventDispatcher();

  // Se almacenarán los datos completos del proof padre para tener más contexto.
  let proofsAboutObject: { parentProof: ReputationProof, box: RPBox }[] = [];

  onMount(() => {
    if (objectId) {
      const allProofs = $proofs;
      const relevantProofs: { parentProof: ReputationProof, box: RPBox }[] = [];
      allProofs.forEach(proof => {
        proof.current_boxes.forEach(box => {
          if (box.object_pointer === objectId) {
            // Guardamos el proof completo junto con la caja (box)
            relevantProofs.push({ parentProof: proof, box: box });
          }
        });
      });
      proofsAboutObject = relevantProofs;
    }
  });

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  // Novedad: Al hacer clic en una prueba, se despacha un evento al padre
  // para que este se encargue de abrir el modal de la prueba correspondiente.
  function handleProofClick(proof: ReputationProof) {
    dispatch('viewProof', { proof: proof });
  }

  function calculateProportion(box: RPBox, total_amount: number): string {
    if (total_amount === 0) return "0.00";
    const proportion = (box.token_amount / total_amount) * 100;
    return proportion.toFixed(2);
  }

</script>

<svelte:window on:keydown={handleKeydown}/>

{#if objectId}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-overlay" on:click|self={handleClose}>
    <article class="proof-card">
        <button class="close-button" on:click={handleClose}>&times;</button>

        <header class="proof-header">
            <div class="header-main-content">
                <h1 class="proof-title" title={objectId}>{objectId}</h1>
                <p class="proof-subtitle">Object Details</p>
            </div>
        </header>

        <section class="details-section">
            <p>A continuación se muestran todas las pruebas de reputación que apuntan a este objeto.</p>
        </section>

        <div class="content-area">
            <div class="detailed-list">
                {#if proofsAboutObject.length > 0}
                    {#each proofsAboutObject as ref (ref.box.box_id)}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- CORRECCIÓN: El click ahora llama a handleProofClick con el objeto de la prueba completo -->
                        <div class="box-card" on:click={() => handleProofClick(ref.parentProof)} role="button" tabindex="0">
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
                                {#if typeof ref.box.content === 'string' && ref.box.content.trim() !== ''}
                                  <strong>Content:</strong><span>{ref.box.content}</span>
                                {:else if typeof ref.box.content === 'object' && ref.box.content !== null && Object.keys(ref.box.content).length > 0}
                                  <strong>Content:</strong><div><pre class="code-font small">{JSON.stringify(ref.box.content, null, 2)}</pre></div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {:else}
                    <p class="empty-state">No reputation proofs found for this object.</p>
                {/if}
            </div>
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
    .code-font {
        font-family: 'Courier New', Courier, monospace;
        background-color: #3a3a3c;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-size: 0.9em;
        word-break: break-all;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background-color: #222;
      padding: 0.5rem;
      border-radius: 4px;
    }
</style>
