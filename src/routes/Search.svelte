<script lang="ts">

	export let showSearch: any; // boolean
	let dialog: any; // HTMLDialogElement

	$: if (dialog && showSearch) dialog.showModal();

  </script>
  
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <dialog bind:this={dialog} on:close={() => (showSearch = false)} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
	  <h2 class="modal-title" id="generateReputationLabel">Search ....</h2>
	  <form >
		<input/>
	  </form>
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

  </style>
  