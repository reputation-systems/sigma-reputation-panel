<script lang="ts">

	export let showSearch: any; // boolean
	let dialog: any; // HTMLDialogElement
	export let input: string

	function close() {
		showSearch = false;
	}

	$: if (dialog && showSearch) dialog.showModal();

  </script>
  
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={dialog} on:close={() => close()} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
	  <h2 class="modal-title" id="generateReputationLabel">Search ....</h2>
	  <form >
		<input bind:value={input} on:input={() => console.log(input)}/>
	  </form>
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
  