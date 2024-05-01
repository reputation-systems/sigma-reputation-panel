<script lang="ts">
	import { updateReputationProofList } from '$lib/unspent_proofs';
	import { generate_reputation_proof } from '$lib/generate_reputation_proof';
	import { explorer_uri, ergo_tree_hash } from '$lib/envs';
	import { ObjectType, type RPBox, type ReputationProof } from '$lib/ReputationProof';
  
	export let showModal: any; // boolean
	let dialog: any; // HTMLDialogElement
  
	let input_proof: null|ReputationProof;
	let input_proof_box: null|RPBox;
	let reputationTokenAmount: number;
	let object_to_assign: string;
	let object_type_to_assign: ObjectType | undefined;
	let tags: string;
  
	let unspend_reputation_proofs: ReputationProof[] = [];

	function handleInputProofChange(event: any) {
		reputationTokenAmount = 0;
		object_to_assign = "";
		handleObjectToAssignChange(event);
	}

	function handleObjectToAssignChange(event: any) {
		object_to_assign = "";
	}
  
	$: {
		if (dialog && showModal) {
			(async () => {
				await fetchReputationProofs(true);
				dialog.showModal();
			})();
		}
	}
  
	function generateReputationProof() {
		generate_reputation_proof(
			reputationTokenAmount, input_proof_box ?? undefined, 
			object_to_assign, object_type_to_assign, tags
		);
	}

	async function fetchReputationProofs(all: boolean = true) {
		try {
			const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo, all);
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
	  <h2 class="modal-title" id="generateReputationLabel">Generate new reputation proof</h2>
	  <hr />
	  <form id="reputationForm">
			<div class="mb-3">
				<label for="reputationTokenTag" class="form-label">Tags<span class="required">*</span></label>
				<input type="text" class="form-control" bind:value={tags} />
			</div>
			<div class="mb-3">
				<label for="object_to_assign" class="form-label">Object to assign all the reputation</label>
				<select class="form-select" bind:value={object_type_to_assign}  on:change={handleInputProofChange}>
					<option value={ObjectType.PlainText}>Plain text</option>
					<option value={ObjectType.ProofByToken}>Other reputation proof</option>
				</select>
				{#if object_type_to_assign == ObjectType.PlainText}
					<input type="text" class="form-control" bind:value={object_to_assign} />
				{/if}
				{#if object_type_to_assign == ObjectType.ProofByToken}
					<select class="form-select" bind:value={object_to_assign}>
						{#each unspend_reputation_proofs as option (option.token_id)}
							{#if input_proof?.token_id !== option.token_id}
								<option value={option.token_id}>
									{option.token_id.slice(0, 10)}
									{#if option.can_be_spend}(yours){/if}
								</option>
							{/if}
						{/each}
					</select>
				{/if}
			</div>
			<div class="mb-3">
				<label for="reputationTokenAmount" class="form-label">Token amount<span class="required">*</span></label>
				<input type="number" min="0" class="form-control" bind:value={reputationTokenAmount} />
			</div>
		</form>
		<hr />
		<!-- svelte-ignore a11y-autofocus -->
		<div class="row">
			<button on:click={generateReputationProof} 
				disabled={!reputationTokenAmount}>
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
  