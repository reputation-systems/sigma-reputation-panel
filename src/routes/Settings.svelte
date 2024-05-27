<script lang="ts">
    import { Network } from "$lib/ReputationProof";
    import { address, network, show_header, fetch_all, advance_mode, compute_deep_level, btc_connector } from "$lib/store";

    export let showModal: any; // boolean
    let dialog: any; // HTMLDialogElement

    $: if (dialog && showModal) dialog.showModal()

    let btc_conn_obj = {
      protocol: 'http',
      url: '',
      port: '',
      contract_type: ''
    };

    $: {
      btc_connector.set(`${btc_conn_obj.protocol}://${btc_conn_obj.url}${btc_conn_obj.port ? ':' + btc_conn_obj.port : ''}/${btc_conn_obj.contract_type}`)
    }
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
          <div>
            <h4>Ergo Platform</h4>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>
              <!-- svelte-ignore a11y-missing-attribute -->
              <a>Address {$address}</a>
            </label>
            <br>
            <label>
              <span class="ml">Network</span>
              <select bind:value={$network}>
                <option value={Network.ErgoTestnet}>Testnet</option>
                <option value={Network.ErgoMainnet}>Mainnet</option>
              </select>
            </label>            
          </div>

          <div>
            <h4>Bitcoin Network</h4>
              <label>
                URL:
                <select bind:value={btc_conn_obj.protocol}>
                  <option value="http">http://</option>
                  <option value="https">https://</option>
                </select>
                <input type="text" placeholder="example.com or 192.168.1.1" bind:value={btc_conn_obj.url}>
                :
                <input type="text" placeholder="port" bind:value={btc_conn_obj.port}>
              </label>          
              <br>
              <label>
                Contract:
                <select bind:value={btc_conn_obj.contract_type}>
                  <option value="Sigma Rune">Sigma Rune</option>
                  <option value="Raw data">Raw data</option>
                </select>
              </label>  
          </div>
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
  