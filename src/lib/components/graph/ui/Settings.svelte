<script lang="ts">
    import { Network } from "$lib/ReputationProof";
    import { address, network, show_header, fetch_all, advance_mode, compute_deep_level } from "$lib/store";

    export let showModal: any; // boolean
    let dialog: any; // HTMLDialogElement

    $: if (dialog && showModal) dialog.showModal()
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
            <a>Address {$address}</a>
          </label>
          <br>
          <label>
            <span class="ml">Network</span>
            <select disabled bind:value={$network}>
             <!-- <option value={Network.ErgoTestnet}>Testnet</option> -->
              <option value={Network.ErgoMainnet}>Mainnet</option>
            </select>
          </label>
        </div>
        <div style="margin-bottom: 20px;">
          <h3>Panel options</h3>
          <label>
            <input type="checkbox" bind:checked={$show_header} on:change={e => show_header.set(e.target.checked)}>
            <span class="ml">Show header</span>
          </label>
          <br>
          <label>
            <input type="checkbox" bind:checked={$advance_mode} on:change={e => advance_mode.set(e.target.checked)}>
            <span class="ml">Advance mode</span>
          </label>
        </div>
        
        <div>
          <h3>Other options</h3>
          <label>
            <input type="checkbox" bind:checked={$fetch_all} on:change={e => fetch_all.set(e.target.checked)}>
            <span class="ml">Fetch all network's proofs</span>
          </label>
          <br>
          <label>
            <input type="number" bind:value={$compute_deep_level} on:change={e => compute_deep_level.set(Number(e.target.value))}>
            <span class="ml">Compute deep level</span>
          </label>
        </div>
        
    </div>
</dialog>

<style>
    dialog {
        width: 600px;
        max-width: 90vw;
        padding: 1.5em;
        border-radius: 1em;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        background-color: #2a2a2a;
        color: #f0f0f0;
        border: 1px solid #444;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.7);
    }

    h2.modal-title {
        font-size: 1.5rem;
        margin: 0;
        color: #FBBF24;
    }
    
    hr {
        border: none;
        border-top: 1px solid #444;
        margin: 1em 0;
    }
</style>
