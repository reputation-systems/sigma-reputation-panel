<script lang="ts">
	import { updateReputationProofList } from '$lib/unspent_proofs';
	import { generate_reputation_proof } from '$lib/generate_reputation_proof';
    import { onMount } from 'svelte';
	import { explorer_uri, ergo_tree_hash } from '$lib/envs';
    import type { ReputationProof } from '$lib/ReputationProof';

	export let showModal: any; // boolean

	let dialog: any; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();

	let selectedOption = "";

	function handleSelectChange(event: any) {
		selectedOption = event.target.value;
	}

	let input_proof: ReputationProof;
	let reputationTokenAmount: string;
	let object_to_assign: string;
	let data_amount_free: any;

	let unspend_reputation_proofs: ReputationProof[] = [];

	onMount(async () => {
		try {
			const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo);
			unspend_reputation_proofs = data;
		} catch (error) {
			console.error(error);
		}
	});

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<h2 class="modal-title" id="generateReputationLabel">Generate new reputation proof</h2>
		<hr />
		<form id="reputationForm">
		  <div class="mb-3">
			<label class="form-label">Choose an option</label>
			<select class="form-select" bind:value={selectedOption} on:change={handleSelectChange}>
			  <option></option>
			  <option value="new">A new one</option>
			  <option value="another">From another reputation prove</option>
			</select>
		  </div>
		  <div>
			  {#if selectedOption === "new"}
				  <div class="mb-3">
					  <label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>
					  <input type="number" class="form-control" bind:value={reputationTokenAmount}/>
				  </div>
			  {/if}
			  {#if selectedOption === "another"}
				  <div class="mb-3">
					  <!-- svelte-ignore a11y-label-has-associated-control -->
					  <label class="form-label">Reputation proof</label>
					  <select class="form-select" bind:value={input_proof}>' +
						  {#each unspend_reputation_proofs as option}
							  <option value={option}>{option.box_id}</option>
						  {/each}
					  </select>
				  </div>
				  <div class="mb-3">
					  <label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>
					  <input type="number" class="form-control" bind:value={reputationTokenAmount} max="{data_amount_free}"/>
				  </div>
			  {/if}
			  {#if selectedOption !== ""}
				  <div class="mb-3">
					  <label for="object_to_assign" class="form-label">Object to assign reputation</label>
					  <input type="text" class="form-control" bind:value={object_to_assign}/>
				  </div>
			  {/if}
		  </div>
		</form>
		<hr />
		<!-- svelte-ignore a11y-autofocus -->
		<div class="row">
			<!-- <button autofocus on:click={() => dialog.close()}>x</button> -->
			<button on:click={() => generate_reputation_proof(
					reputationTokenAmount,
					input_proof,
					object_to_assign
			)}>Generate proof</button>
		</div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
