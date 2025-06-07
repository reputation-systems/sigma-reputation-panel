<script lang="ts">
    // DataModal no longer uses the store. It receives data and visibility state as props.
    import { renderedToString } from '$lib/utils';

    export let showModal: boolean;
    export let data: any; // The proof or linked_object will be passed here.

    let dialog: HTMLDialogElement;

    // When showModal changes to true, we show the dialog.
    $: if (dialog && showModal) {
        dialog.showModal();
    }

    // Function to close the modal. This will update the bind:showModal in the parent.
    function close() {
        showModal = false;
    }

    const baseHashes = {
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': 'SHA2 256',
      'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a': 'SHA3 256',
      '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f': 'SHAKE 256'
    };
  
</script>

<!-- The component is now a native <dialog>, just like ComputeSearchModal -->
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={close} on:click|self={close}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-content" on:click|stopPropagation>
        {#if data}
            {#if "hashes" in data}
                <!-- Render for LinkedObject -->
                <div class="linked-object-type">
                    <h2>Object Details</h2>
                    {#each data.hashes as {algorithm, value}}
                    <div>
                        <strong>{baseHashes[algorithm] ?? algorithm ?? 'Unknown'}:</strong> {value}
                    </div>
                    {/each}

                    <h3>Opinions</h3>
                    {#each data.opinions as {proof_id, content}}
                    {#if Object.keys(content).length > 0}
                    <div>
                        <strong>From {proof_id.slice(0, 10) ?? 'Unknown'}:</strong> {JSON.stringify(content)}
                    </div>
                    {/if}
                    {/each}
                </div>
            {:else if "token_id" in data}
                <!-- Render for ReputationProof -->
                <div class="proof-type">
                    <h2>Details for Proof { data.token_id.slice(0, 15) }...</h2>
            
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
                                            <td title={b.box_id}>{b.box_id.slice(0, 10)}...</td>
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
        {/if}
    </div>
</dialog>

<style>
    /* Modal styles are now applied to the dialog element */
    dialog {
        background: #2a2a2a;
        padding: 1.5rem;
        border-radius: 8px;
        width: 90%;
        max-width: 900px;
        border: 1px solid #444;
        color: #f0f0f0;
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.7);
    }
    .modal-content {
        word-wrap: break-word;
        max-height: 85vh; 
        overflow: auto;
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
</style>