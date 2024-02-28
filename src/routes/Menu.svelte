<script lang="ts">
    import { ControlButton } from "@xyflow/svelte";
    import Modal from "./Modal.svelte";

    export let connected: boolean = false;
    let showModal = false;
</script>

<!-- svelte-ignore missing-declaration -->
{#if connected}
    <ControlButton on:click={() => (showModal = true)}><i class="fas fa-cog" style="color: black;"></i></ControlButton>
{/if}

<Modal bind:showModal />