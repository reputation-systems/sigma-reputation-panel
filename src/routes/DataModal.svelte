<script lang="ts">
    import { data_store } from '$lib/store';
    import { renderedToString } from '$lib/utils';
</script>

<div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if $data_store !== null}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="modal" on:click={() => data_store.set(null)}>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="modal-content" on:click|stopPropagation>
                <h2>Details of the proof { $data_store.token_id }</h2>
                
                <!-- JSON data display -->
                {#if $data_store.data !== null}
                    <pre><code>{JSON.stringify($data_store.data, null, 2)}</code></pre>
                {/if}

                <!-- Table for current_boxes -->
                {#if $data_store.current_boxes && $data_store.current_boxes.length > 0}
                    <h3>Current Boxes</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Box ID</th>
                                    <th>Proportion (%)</th>
                                    <th>Token Amount</th>
                                    <th>Negative</th>
                                     <th>Object Type</th>
                                    <th>Object Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each $data_store.current_boxes as b}
                                    <tr>
                                        <td>{b.box_id}</td>
                                        <td>{(parseFloat(Number(b.token_amount / $data_store.total_amount * 100).toFixed(3)))}</td>
                                        <td>{b.token_amount}</td>
                                        <td>{b.negative ? 'Yes' : 'No'}</td>
                                        <td>{b.object_type}</td>
                                        <td>{renderedToString(b.object_value)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
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
        padding: 1rem;
        border-radius: 5px;
        width: 70%;
        max-width: 70%;
        word-wrap: break-word;
        max-height: 80vh; 
        overflow: auto; 
    }

    .table-container {
        overflow: auto;
        max-height: 60vh; 
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        white-space: nowrap; 
    }

    th, td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #f4f4f4;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    tr:hover {
        background-color: #f1f1f1;
    }
</style>
