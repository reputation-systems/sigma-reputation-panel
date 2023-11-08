<script lang="ts">
  import Modal from './Modal.svelte';
  let showModal = false;
  let connected = false;

  async function connectNautilus() {
    if (typeof ergoConnector !== 'undefined') {
      const nautilus = ergoConnector.nautilus;
      if (nautilus) {
        connected = await nautilus.connect();
        if (connected) {
          alert('Connected!');
        } else {
          alert('Not connected!');
        }
      } else {
        alert('Nautilus Wallet is not active');
      }
    } else {
      alert('No wallet available');
    }
  }
</script>

<style>

    .modal-content {
      position: absolute;
      top: 25%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .alert-message {
      text-align: center;
      font-size: 20px;
      color: #333;
    }

  h1 {
    font-size: 24px;
    text-align: center;
    margin: 20px 0;
  }

  button {
    padding: 10px 20px;
    font-size: 16px;
    margin: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }

  button:hover {
    background-color: #0056b3;
  }

  .button-container {
    text-align: center;
  }
</style>

<h1>Welcome to the Reputation System Panel</h1>

<div class="button-container">
  <button on:click={connectNautilus}>Connect to Nautilus</button>

  {#if connected}
    <button on:click={() => (showModal = true)}>Generate reputation proof</button>
  {/if}
</div>

<Modal bind:showModal />


<div class="modal" id="alertModal">
  <div class="modal-content">
    <p class="alert-message">Attention! This is a test version. <br><br> Please, don't use on MainNet.</p>
  </div>
</div>