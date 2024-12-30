<script lang="ts">
    import { data_store } from '$lib/store';
</script>

<div>
<!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if $data_store !== null}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="modal" on:click={() => data_store.set(null)}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modal-content" on:click|stopPropagation>
            <h2>{ $data_store[0] }</h2>
            <pre><code>{JSON.stringify($data_store[1], null, 2)}</code></pre>
        </div>
    </div>
{/if}
</div>

<style>
    .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
    }
    .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 5px;
            width: 70%;
            max-width: 70%;
            word-wrap: break-word;
            overflow: auto;
    }
</style>