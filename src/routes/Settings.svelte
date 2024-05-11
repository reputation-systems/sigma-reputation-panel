<script lang="ts">
    import { Network } from "$lib/ReputationProof";

    export let showModal: any; // boolean
    let dialog: any; // HTMLDialogElement
  
    export let setter: CallableFunction;
    let zen_mode = false;
    let advance_mode = false;
    let fetch_all = false;
    let network = "";
    let address = "";
    let compute_deep_level = 5;

    async function refresh() {
      zen_mode = await setter("zen", null);  
      advance_mode = await setter("advance", null);
      fetch_all = await setter("fetch_all", null);
      network = await setter("network", null);
      address = await setter("address", null);
      compute_deep_level = await setter("compute_deep_level", null);
      dialog.showModal();
    }

    $: if (dialog && showModal) refresh()
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => dialog.close()}>
    <div on:click|stopPropagation>
      <h2 class="modal-title" id="settingsLabel">Settings</h2>
      <hr />
      <form class="modal" id="settingsForm">
        <div style="margin-bottom: 20px;">
          <h3>Networks</h3>
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label>
            <!-- svelte-ignore a11y-missing-attribute -->
            <a>Address {address}</a>
          </label>
          <br>
          <label>
            <span class="ml">Network</span>
            <select bind:value={network}>
              <option value={Network.ErgoTestnet}>Testnet</option>
              <option value={Network.ErgoMainnet}>Mainnet</option>
            </select>
          </label>
        </div>
        <div style="margin-bottom: 20px;">
          <h3>Panel modes</h3>
          <label>
            <input type="checkbox" bind:checked={zen_mode} on:change={() => setter("zen", zen_mode)}>
            <span class="ml">Zen mode</span>
          </label>
          <br>
          <label>
            <input type="checkbox" bind:checked={advance_mode} on:change={() => setter("advance", advance_mode)}>
            <span class="ml">Advance mode</span>
          </label>
        </div>
      
        <div>
          <h3>Other options</h3>
          <label>
            <input type="checkbox" bind:checked={fetch_all} on:change={() => setter("fetch_all", fetch_all)}>
            <span class="ml">Fetch all network's proofs</span>
          </label>
          <br>
          <label>
            <input type="number" bind:value={compute_deep_level} on:change={() => setter("compute_deep_level", compute_deep_level)}>
            <span class="ml">Compute deep level</span>
          </label>
        </div>
      </form>
      
    </div>
</dialog>

<style>
	dialog {
    width: 600px;
	  border-radius: 1em;
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
  