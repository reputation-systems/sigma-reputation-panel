<script lang="ts">
    import { searchStore } from "$lib/store";

    export let showSearch: any;
    let dialog: any;
	let input: string = "";

    function close() {
        showSearch = false;
    }

    function search() {
		searchStore.set(input);
        dialog.close();
    }

	function clear() {
		input = "";
		searchStore.set(null);
		dialog.close();
	}
    
    $: {
        if (dialog && showSearch) {
            input = $searchStore ?? "";
            dialog.showModal();
        }
    }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => close()} on:click|self={() => dialog.close()}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <h2 class="modal-title" id="generateReputationLabel">Search ....</h2>
        <form on:submit|preventDefault={search}>
            <input bind:value={input} />
            <button type="submit">Search</button>
            {#if input}
                <button type="button" on:click={() => clear()}>❌</button>
            {/if}
        </form>
    </div>
</dialog>

<style>
    dialog {
        max-width: 32em;
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
</style>
