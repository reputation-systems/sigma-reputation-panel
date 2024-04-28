<script lang="ts">
    export let showModal: any; // boolean
    let dialog: any; // HTMLDialogElement
  
    let zen_mode = false;  
    let advance_mode = false;  

    $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => dialog.close()}>
    <div on:click|stopPropagation>
      <h2 class="modal-title" id="settingsLabel">Settings</h2>
      <hr />
      <form id="settingsForm">
        <label>
          <input type="checkbox" bind:checked={zen_mode} on:change={() => console.log(`Zen mode: ${zen_mode}`)}>
          <span class="ml">Zen mode</span>
        </label>

        <label>
          <input type="checkbox" bind:checked={advance_mode} on:change={() => console.log(`Advance mode: ${advance_mode}`)}>
          <span class="ml">Advance mode</span>
        </label>
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
  
	hr {
	  border: none;
	  border-top: 1px solid #ccc;
	  margin: 1em 0;
	}
  </style>
  