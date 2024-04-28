<script lang="ts">
    import { ControlButton } from "@xyflow/svelte";
    import FormModal from "./Modal.svelte";
    import Search from "./Search.svelte";

    export let connected: boolean = false;
    let showForm = false;
    let showSearch = false;
</script>

<!-- svelte-ignore missing-declaration -->
{#if connected}
    <ControlButton on:click={() => (showForm = true)}><i class="fas fa-solid fa-bullhorn" style="color: black;"></i></ControlButton>
    <ControlButton on:click={() => (showSearch = true)}><i class="fas fa-solid fa-search" style="color: black;"></i></ControlButton>
{/if}

<FormModal bind:showModal={showForm} />
<Search bind:showSearch />