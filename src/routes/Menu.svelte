<script lang="ts">
    import { ControlButton } from "@xyflow/svelte";
    import Modal from "./Modal.svelte";

    export let connected = false;
    let showModal = false;

    async function connectNautilus() {
        if (typeof ergoConnector !== 'undefined') {
        const nautilus = ergoConnector.nautilus;
        if (nautilus) {
            connected = await nautilus.connect();
            if (connected) {
                console.log('Connected!');
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

    if (!connected) { connectNautilus() }
</script>

<!-- svelte-ignore missing-declaration -->
{#if connected}
<ControlButton on:click={() => (showModal = true)}><i class="fas fa-cog" style="color: black;"></i></ControlButton>
{/if}

<Modal bind:showModal />