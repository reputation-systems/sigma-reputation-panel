<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { proofs } from '$lib/store';
  import type { RPBox } from '$lib/ReputationProof';

  export let objectId: string | null;

  const dispatch = createEventDispatcher();

  let proofsAboutObject: RPBox[] = [];

  onMount(() => {
    if (objectId) {
      const allProofs = $proofs;
      const relevantProofs: RPBox[] = [];
      allProofs.forEach(proof => {
        proof.current_boxes.forEach(box => {
          if (box.object_pointer === objectId) {
            relevantProofs.push(box);
          }
        });
      });
      proofsAboutObject = relevantProofs;
    }
  });

  function handleClose() {
    dispatch('close');
  }
</script>

<div class="modal-backdrop" on:click={handleClose}>
  <div class="modal-content" on:click|stopPropagation>
    <header class="modal-header">
      <h2>Object Details</h2>
      <button class="close-button" on:click={handleClose}>&times;</button>
    </header>
    <div class="modal-body">
      {#if objectId}
        <div class="object-id-section">
          <strong>Object ID:</strong>
          <span class="code-font">{objectId}</span>
        </div>
        <hr />
        <h3>Reputation Proofs About This Object</h3>
        {#if proofsAboutObject.length > 0}
          <ul class="proof-list">
            {#each proofsAboutObject as box}
              <li class="proof-item" class:positive={box.polarization} class:negative={!box.polarization}>
                <span class="polarization-icon">
                  {box.polarization ? '👍' : '👎'}
                </span>
                <div class="proof-details">
                  <p><strong>From Token:</strong> <span class="code-font small">{box.token_id.slice(0, 15)}...</span></p>
                  <p><strong>Amount:</strong> {box.token_amount}</p>
                   {#if typeof box.content === 'string' && box.content.trim() !== ''}
                     <p><strong>Content:</strong> {box.content}</p>
                   {:else if typeof box.content === 'object' && box.content !== null && Object.keys(box.content).length > 0}
                     <!-- CORRECCIÓN: Se usa un div en lugar de un p para contener el pre -->
                     <div>
                        <strong>Content:</strong>
                        <pre class="code-font small">{JSON.stringify(box.content, null, 2)}</pre>
                     </div>
                   {/if}
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <p>No reputation proofs found for this object.</p>
        {/if}
      {:else}
        <p>No object ID provided.</p>
      {/if}
    </div>
  </div>
</div>

<style>
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
    z-index: 9999;
  }
  .modal-content {
    background-color: #2c2c2e;
    color: #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #444;
  }
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }
  .close-button {
    background: none;
    border: none;
    font-size: 1.75rem;
    color: #aaa;
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }
   .close-button:hover {
     color: white;
   }
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }
  .object-id-section {
    margin-bottom: 1rem;
  }
  .code-font {
    font-family: 'Courier New', Courier, monospace;
    background-color: #3a3a3c;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    word-break: break-all;
  }
  .small {
      font-size: 0.8em;
  }
  hr {
    border: none;
    border-top: 1px solid #444;
    margin: 1.5rem 0;
  }
  h3 {
      margin-top: 0;
      color: #FBBF24;
  }
  .proof-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .proof-item {
    background-color: #3a3a3c;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    border-left: 5px solid;
  }
  .proof-item.positive {
      border-left-color: #4caf50;
  }
  .proof-item.negative {
      border-left-color: #f44336;
  }
  .polarization-icon {
      font-size: 1.5rem;
  }
  .proof-details p {
      margin: 0 0 0.5rem 0;
  }
  .proof-details p:last-child {
      margin-bottom: 0;
  }
  pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background-color: #222;
      padding: 0.5rem;
      border-radius: 4px;
  }
</style>
