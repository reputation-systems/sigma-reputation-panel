<script lang="ts">
    import { ObjectType, compute, type ReputationProof } from "$lib/ReputationProof";
    import { stringToRendered } from "$lib/utils";

	export let proof: ReputationProof;
	export let showModal: any;
	let dialog: any;
	let input: string = ""
	let result: number|null = null;

	function close() {
		showModal = false;
	}

	function computeResult() {
		result = compute(proof, ObjectType.PlainText, input);
	}

	$: if (dialog && showModal) dialog.showModal();
</script>
  
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => close()} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<h2 class="modal-title" id="generateReputationLabel">Compute {proof.token_id.slice(0, 10)} to ...</h2>
		<form>
			<input bind:value={input}/>
			<button type="button" on:click={computeResult}>Calculate</button>
		</form>
		{#if result !== null}
			<!-- svelte-ignore a11y-missing-attribute -->
			<a>Result: {result}</a>
		{/if}
	</div>
</dialog>
  

  <style>
	dialog {
		border-radius: 1em;
	  	max-width: 32em;
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

  </style>
  