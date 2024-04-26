<script lang="ts">
	import { generate_reputation_proof } from '$lib/generate_reputation_proof';
  
	export let showModal: boolean; // boolean
	let dialog: HTMLDialogElement;
  
	let reputationTokenAmount: number;
  
	$: if (dialog && showModal) dialog.showModal();
  
	function generateReputationProof() {
	  generate_reputation_proof(reputationTokenAmount);
	}
  </script>
  
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
	  <h2 class="modal-title" id="generateReputationLabel">Generate Reputation Proof</h2>
	  <hr />
	  <form id="reputationForm">
		<div class="mb-3">
		  <label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>
		  <input type="number" min="0" class="form-control" bind:value={reputationTokenAmount} />
		</div>
	  </form>
	  <hr />
	  <!-- svelte-ignore a11y-autofocus -->
	  <div class="row">
		<button on:click={generateReputationProof} disabled={!reputationTokenAmount}>Generate proof</button>
	  </div>
	</div>
  </dialog>
  
  <style>
	dialog {
	  max-width: 32em;
	  border-radius: 0.05em;
	  padding: 1em;
	  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
  
	dialog::backdrop {
	  background: rgba(0, 0, 0, 0.5);
	}
  
	h2.modal-title {
	  font-size: 1.5rem;
	  margin: 0;
	}
  
	hr {
	  border: none;
	  border-top: 1px solid #ccc;
	  margin: 1em 0;
	}
  
	.mb-3 {
	  margin-bottom: 1.5em;
	}
  
	.form-label {
	  font-weight: bold;
	}
  
	.form-control {
	  width: 100%;
	  padding: 0.5em;
	  font-size: 1rem;
	  border: 0.025px solid #ccc;
	  border-radius: 0.25em;
	}
  
	.required {
	  color: red;
	}
  
	.row {
	  display: flex;
	  justify-content: flex-end;
	}
  
	button {
	  padding: 0.5em 1em;
	  font-size: 1rem;
	  background-color: rgb(17, 17, 17);
	  color: #fff;
	  border: none;
	  cursor: pointer;
	  border-radius: 0.25em;
	}
  
	button:hover {
	  background-color: rgb(17, 17, 17);
	}
  </style>
  