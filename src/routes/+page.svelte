<script lang="ts">
    import Modal from './Modal.svelte';
    let showModal = false;

    let connected = false;

    async function connectNautilus()
    {
        if (ergoConnector) { // check if Connection API is injected
          const nautilus = ergoConnector.nautilus;
          if (nautilus) { // check if Nautilus Wallet is available
            console.log("Nautilus Wallet is ready to use");
            connected = await nautilus.connect();
            if (connected) {
              console.log("Connected!");
            } else {
              console.log("Not connected!");
            }
          } else {
            console.log("Nautilus Wallet is not active");
          }
        } else {
          console.log("No wallet available");
        }
    }
</script>


<h1>Welcome to the Reputation System Panel</h1>



<button on:click={connectNautilus}>Connect to Nautilus</button>

{#if connected}
    <button on:click={() => (showModal = true)}> Generate reputation proof </button>

    <Modal bind:showModal/>
{/if}