<script lang="ts">
    import { updateReputationProofList } from "$lib/unspent_proofs";
    import { generate_reputation_proof } from "$lib/generate_reputation_proof";
    import { explorer_uri, ergo_tree_hash } from "$lib/envs";
    import {
        ObjectType,
        type RPBox,
        type ReputationProof,
    } from "$lib/ReputationProof";

    export let showModal: boolean;
    let dialog: any;
    let showAdvancedOptions: boolean = false;

    let input_proof: null | ReputationProof;
    let input_proof_box: null | RPBox;
    let negative: boolean = false;
    let reputationTokenAmount: number = 100;
    let object_to_assign: string;
    let object_type_to_assign: ObjectType | undefined;
    let tags: string = "reputation-proof-token";

    let unspend_reputation_proofs: ReputationProof[] = [];

    let linkedHashes = [
        { algorithm: null, value: '' }
    ];

    const baseHashes = {
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': 'SHA2 256',
        'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a': 'SHA3 256',
        '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f': 'SHAKE 256'
    };


    function handleInputProofChange(event: any) {
        object_to_assign = "";
        handleObjectToAssignChange(event);
    }

    function handleObjectToAssignChange(event: any) {
        object_to_assign = "";
    }

    function addNewHash() {
        linkedHashes = [...linkedHashes, { algorithm: null, value: '' }];
    }

    function removeHash(index: number) {
        linkedHashes = linkedHashes.filter((_, i) => i !== index);
    }

    $: {
        if (dialog && showModal) {
            (async () => {
                await fetchReputationProofs(true);
                dialog.showModal();
            })();
        }
    }

    function generateReputationProof() {
        generate_reputation_proof(
            reputationTokenAmount,
            input_proof_box ?? undefined,
            object_to_assign,
            object_type_to_assign,
            negative,
            tags,
        );
    }

    async function fetchReputationProofs(all: boolean = true) {
        try {
            const data = await updateReputationProofList(
                explorer_uri,
                ergo_tree_hash,
                ergo,
                all,
                null,
            );
            unspend_reputation_proofs = Array.from(data.values());
        } catch (error) {
            console.error(error);
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation class="modal-content">
        <h2 class="modal-title" id="generateReputationLabel">
            Generate new reputation proof
        </h2>
        <hr />
        <form id="reputationForm">
            <div class="mb-3">
                <label for="object_to_assign" class="form-label"
                    >Object to assign all the reputation</label
                >
                <select
                    class="form-select"
                    bind:value={object_type_to_assign}
                    on:change={handleInputProofChange}
                >
                    <option value={ObjectType.PlainText}>Plain text</option>
                    <option value={ObjectType.ProofByToken}>Reputation proof</option>
                    <option value={ObjectType.LinkedObject}>Linked Object</option>
                </select>
                {#if object_type_to_assign == ObjectType.PlainText}
                    <input
                        type="text"
                        class="form-control"
                        bind:value={object_to_assign}
                        style="max-width: 97%;"
                    />
                {/if}
                {#if object_type_to_assign == ObjectType.ProofByToken}
                    <select class="form-select" bind:value={object_to_assign}>
                        {#each unspend_reputation_proofs as option (option.token_id)}
                            {#if input_proof?.token_id !== option.token_id}
                                <option
                                    class="custom-option"
                                    value={option.token_id}
                                >
                                    <span class="token-id"
                                        >{option.token_id.slice(0, 10)}</span
                                    >
                                    {#if option.tag}<span class="tag"
                                            >● {option.tag}</span
                                        >{/if}
                                    {#if option.can_be_spend}● yours{/if}
                                </option>
                            {/if}
                        {/each}
                    </select>
                {/if}
                {#if object_type_to_assign === ObjectType.LinkedObject}
					<div class="linked-hashes mt-2">
						{#each linkedHashes as hash, i}
						<div class="hash-pair mb-2">
							{#if hash.algorithm === null}
								<select class="form-select mb-1" bind:value={hash.algorithm}>
									<option value="">Select Algorithm</option>
									{#each Object.entries(baseHashes) as [hashValue, name]}
										{#if !linkedHashes.some(linked => linked.algorithm === hashValue)}
											<option value={hashValue}>{name}</option>
										{/if}
									{/each}
									<option value="">Other</option>
								</select>
							{:else if hash.algorithm.length < 64}
								<input
									type="text"
									class="form-control mb-1"
									placeholder="Enter hash identifier"
									bind:value={hash.algorithm}
								/>
							{:else if hash.algorithm !== null && hash.algorithm in baseHashes}
								<!-- svelte-ignore a11y-missing-attribute -->
								<input
									type="text"
									disabled
									class="form-control mb-1"
									placeholder="Enter hash identifier"
									bind:value={baseHashes[String(hash.algorithm)]}
								>
							{/if}
							<input 
								type="text" 
								class="form-control"
								placeholder="Hash value"
								bind:value={hash.value}
							/>
							<button
								type="button"
								class="btn btn-danger btn-sm"
								on:click={() => removeHash(i)}
							>
								Delete
							</button>
						</div>
						{/each}
						<button class="btn btn-primary" type="button" on:click={addNewHash}>Add Hash</button>
					</div>
				{/if}
            </div>

            <div class="mb-3">
                <label for="polarCheckbox" class="form-check-label"
                    >Negative</label
                >
                <input
                    type="checkbox"
                    class="form-check-input"
                    id="polarCheckbox"
                    bind:checked={negative}
                />
            </div>

            <div style="position: relative;">
                <hr style="border-color: #ccc;" />
                <span
                    on:click={() =>
                        (showAdvancedOptions = !showAdvancedOptions)}
                    style="user-select: none; position: absolute; left: 40%; top: -0.75em; background-color: #fff; padding: 0 0.5em; font-size: 0.75rem;"
                >
                    Advanced Options
                </span>
            </div>
            {#if showAdvancedOptions}
                <div class="mb-3">
                    <label for="reputationTokenAmount" class="form-label"
                        >Token amount</label
                    >
                    <input
                        type="number"
                        min="0"
                        class="form-control"
                        bind:value={reputationTokenAmount}
                        style="max-width: 97%;"
                    />
                </div>
                <div class="mb-3">
                    <label for="reputationTokenTag" class="form-label"
                        >Tags</label
                    >
                    <input
                        type="text"
                        class="form-control"
                        bind:value={tags}
                        style="max-width: 97%;"
                    />
                </div>
            {/if}
        </form>
        <hr />
        <!-- svelte-ignore a11y-autofocus -->
        <div class="row">
            <button
                on:click={generateReputationProof}
                disabled={!reputationTokenAmount}
            >
                Generate proof
            </button>
        </div>
    </div>
</dialog>

<style>
    dialog {
        max-width: 100rem;;
        border-radius: 1em;
        padding: 1em;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }

    h2.modal-title {
        font-size: 1.5rem;
        margin: 0;
    }

    hr {
        border: none;
        border-top: 1px solid #ccc;
        margin: 1em 0;
    }

    .mb-3 {
        margin-bottom: 1.5em;
    }

    .form-label {
        font-weight: bold;
    }

    .form-select,
    .form-control {
        width: 100%;
        padding: 0.5em;
        font-size: 1rem;
        border: 0.025px solid #ccc;
        border-radius: 0.25em;
        margin-bottom: 0.5rem;
    }

    .modal-content {
        width: 90%;
        max-width: 900px;
        margin: auto;
    }
    .hash-pair {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .tag {
        color: #666;
    }

    .form-select {
        height: 2.5em;
    }

    .row {
        display: flex;
        justify-content: flex-end;
    }

    button {
        padding: 0.5em 1em;
        font-size: 1rem;
        background-color: rgb(17, 17, 17);
        color: #fff;
        border: none;
        cursor: pointer;
        border-radius: 0.25em;
    }

    button:hover {
        background-color: rgb(17, 17, 17);
    }
</style>
