<script lang="ts">
    import { renderedToString } from '$lib/utils';

    export let showModal: boolean;
    export let data: any; 

    let dialog: HTMLDialogElement;

    $: if (dialog && showModal) {
        dialog.showModal();
    }

    function close() {
        showModal = false;
    }  
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={close} on:click|self={() => dialog.close()}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-content" on:click|stopPropagation>
        {#if data}
            <div class="proof-type">
                <h2>Details for Proof { data.token_id }</h2>
        
                {#if data.data && Object.keys(data.data).length > 0}
                    <h3>Proof Data (R9)</h3>
                    <pre><code>{JSON.stringify(data.data, null, 2)}</code></pre>
                {/if}

                {#if data.current_boxes && data.current_boxes.length > 0}
                    <h3>Boxes</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Box ID</th>
                                    <th>Proportion</th>
                                    <th>Negative</th>
                                    <th>Object Type</th>
                                    <th>Object Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each data.current_boxes as b}
                                    <tr>
                                        <td title={b.box_id}>{b.box_id}</td>
                                        <td>{(parseFloat(Number(b.token_amount / data.total_amount * 100).toFixed(3)))}%</td>
                                        <td>{b.negative ? 'Yes' : 'No'}</td>
                                        <td>{b.object_type ?? 'N/A'}</td>
                                        <td title={renderedToString(b.object_value)}>{(renderedToString(b.object_value) ?? "").slice(0, 20)}...</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</dialog>

<style>
    dialog {
        background: #2a2a2a;
        padding: 1.5rem;
        border-radius: 8px;
        width: 90%;
        max-width: 1800px;
        border: 1px solid #444;
        color: #f0f0f0;
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.7);
    }
    .modal-content {
        position: relative; 
        word-wrap: break-word;
        max-height: 85vh; 
        overflow: auto;
    }

    .close-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 2rem;
        line-height: 1;
        color: #aaa;
        cursor: pointer;
        padding: 0.5rem;
    }
    .close-button:hover {
        color: #fff;
    }

    .table-container {
        overflow: auto;
        max-height: 60vh; 
        border: 1px solid #444;
        border-radius: 6px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; white-space: nowrap; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #444; }
    th { background-color: #333; font-weight: bold; position: sticky; top: 0; }
    tr:nth-child(even) { background-color: #333; }
    tr:hover { background-color: #3a3a3a; }
    h2, h3 { color: #FBBF24; margin-bottom: 1rem; }
    pre { background-color: #222; padding: 0.5rem; border-radius: 4px; white-space: pre-wrap; }

    .opinions-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .opinion-item strong {
        display: block;
        margin-bottom: 0.5rem;
    }
</style>
