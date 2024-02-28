<script lang="ts">
	import { updateReputationProofList } from '$lib/unspent_proofs';
	import { generate_reputation_proof } from '$lib/generate_reputation_proof';
	import { explorer_uri, ergo_tree_hash } from '$lib/envs';
	import type { RPBox, ReputationProof } from '$lib/ReputationProof';
  
	export let showModal: any; // boolean
	let dialog: any; // HTMLDialogElement
  
	let selectedOption = "";  
	let input_proof: null|ReputationProof;
	let input_proof_box: null|RPBox;
	let reputationTokenAmount: number;
	let object_to_assign: string;
  
	let unspend_reputation_proofs: ReputationProof[] = [];

	function handleSelectChange(event: any) {
	  fetchReputationProofs();
	  selectedOption = event.target.value;
	  input_proof_box = null;
	  handleInputProofChange(event);
	}

	function handleInputProofChange(event: any) {
		reputationTokenAmount = 0;
		object_to_assign = "";
	}
  
	$: if (dialog && showModal) dialog.showModal();
  
	function generateReputationProof() {
		generate_reputation_proof(reputationTokenAmount, input_proof_box ?? undefined, object_to_assign);
	}

	async function fetchReputationProofs() {
		try {
			console.log('Searching for boxes....')
			const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo);
			unspend_reputation_proofs = data;
		} catch (error) {
			console.error(error);
		}
	}

  </script>
  
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
	  <h2 class="modal-title" id="generateReputationLabel">Generate reputation proof</h2>
	  <hr />
	  <form id="reputationForm">
		<div class="mb-3">
		  <!-- svelte-ignore a11y-label-has-associated-control -->
		  <label class="form-label">Choose an option</label>
		  <select class="form-select" bind:value={selectedOption} on:change={handleSelectChange}>
			<option></option>
			<option value="new">Generate a new one</option>
			<option value="another">Update a current one</option>
		  </select>
		</div>
		{#if selectedOption === "new"}
			<div class="mb-3">
				<label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>
				<input type="number" min="0" class="form-control" bind:value={reputationTokenAmount} />
			</div>
		{/if}
		{#if selectedOption === "another"}
			<div class="mb-3">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="form-label">Reputation proof</label>
				<select class="form-select" bind:value={input_proof} on:change={handleInputProofChange}>
					{#each unspend_reputation_proofs as option (option.token_id)}
						<option value={option}>{option.token_id.slice(0, 10)}</option>
					{/each}
				</select>
			</div>
			{#if input_proof}
				<div class="mb-3">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="form-label">Proof box</label>
					<select class="form-select" bind:value={input_proof_box} on:change={handleInputProofChange}>
						{#each input_proof.current_boxes as option (option.box_id)}
							<option value={option}>{option.box_id.slice(0, 10)} - ({option.token_amount})</option>
						{/each}
					</select>
				</div>
				{#if input_proof_box }
					<div class="mb-3">
						<label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>
						<span style="align-self: flex-end;">Up to: {input_proof_box.token_amount}</span>
						<input type="number" min="0" class="form-control" bind:value={reputationTokenAmount} max="{input_proof_box.token_amount}" />
					</div>
				{/if}
			{/if}
		{/if}
		{#if selectedOption !== ""}
			<div class="mb-3">
				<label for="object_to_assign" class="form-label">Object to assign reputation</label>
				<input type="text" class="form-control" bind:value={object_to_assign} />
			</div>
		{/if}
		</form>
		<hr />
		<!-- svelte-ignore a11y-autofocus -->
		<div class="row">
			<button on:click={generateReputationProof} 
				disabled={!reputationTokenAmount || selectedOption == "another" && !input_proof_box}>
				Generate proof
			</button>
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
  
	.form-select, .form-control {
	  width: 100%;
	  padding: 0.5em;
	  font-size: 1rem;
	  border: 0.025px solid #ccc;
	  border-radius: 0.25em;
	}
  
	.form-select {
	  height: 2.5em;
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
	  background-color: #007bff;
	  color: #fff;
	  border: none;
	  cursor: pointer;
	  border-radius: 0.25em;
	}
  
	button:hover {
	  background-color: #0056b3;
	}
  </style>
  