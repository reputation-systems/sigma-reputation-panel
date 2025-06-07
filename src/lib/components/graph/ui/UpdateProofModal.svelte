<script lang="ts">
import { updateReputationProofList } from '$lib/unspent_proofs';
import { generate_reputation_proof } from '$lib/generate_reputation_proof';
import { explorer_uri, ergo_tree_hash } from '$lib/envs';
import { type LinkedHash } from '$lib/LinkedObject';
import { ObjectType, type RPBox, type ReputationProof } from '$lib/ReputationProof';
    import JsonInput from './JsonInput.svelte';

export let showModal: boolean; // boolean
let dialog: any; // HTMLDialogElement

export let proof: ReputationProof;
let input_proof_box: null|RPBox;
let reputationTokenAmount: number;
let object_to_assign: string;
let object_type_to_assign: ObjectType | undefined;
let tags: string;
let negative: boolean = false;
let data: object = {};

let unspend_reputation_proofs: ReputationProof[] = [];

let linkedHashes: LinkedHash[] = [
    { algorithm: null, value: '' }
];

const baseHashes = {
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': 'SHA2 256',
    'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a': 'SHA3 256',
    '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f': 'SHAKE 256'
};

function handleInputProofChange(event: any) {
	reputationTokenAmount = 0;
	object_to_assign = "";
	handleObjectToAssignChange(event);
}

function addNewHash() {
    linkedHashes = [...linkedHashes, { algorithm: null, value: '' }];
}

function removeHash(index: number) {
    linkedHashes = linkedHashes.filter((_, i) => i !== index);
}

function handleObjectToAssignChange(event: any) {
	object_to_assign = "";
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

	if (object_type_to_assign === ObjectType.LinkedObject) {
		object_to_assign = JSON.stringify(linkedHashes.filter(item => typeof(item.algorithm) === "string" && item.algorithm.length >= 64));
	}

	generate_reputation_proof(
		(reputationTokenAmount / 100) * proof.total_amount,
		input_proof_box ?? undefined, 
		object_to_assign, 
		object_type_to_assign, 
		negative, 
		tags,
		data
	);
}

async function fetchReputationProofs(all: boolean = true) {
	try {
		const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo, all, null);
		unspend_reputation_proofs = Array.from(data.values());
	} catch (error) {
		console.error(error);
	}
}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation class="modal-content">
		<h2 class="modal-title" id="generateReputationLabel">Update reputation proof</h2>
		<hr />
		<form id="reputationForm">
		<div class="mb-3">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="form-label">Proof box</label>
			<select class="form-select" bind:value={input_proof_box} on:change={handleInputProofChange}>
				{#each proof.current_boxes as option (option.box_id)}
					<option value={option}>{option.box_id.slice(0, 10)} - ({option.token_amount / proof.total_amount * 100}%)</option>
				{/each}
			</select>
		</div>
		{#if input_proof_box}
			<div class="mb-3">
				<label for="object_to_assign" class="form-label">Object to assign reputation</label>
				<select class="form-select" bind:value={object_type_to_assign}  on:change={handleInputProofChange}>
					<option value={ObjectType.PlainText}>Plain text</option>
					<option value={ObjectType.ProofByToken}>Reputation proof</option>
					<option value={ObjectType.LinkedObject}>Linked Object</option>
				</select>
				{#if object_type_to_assign == ObjectType.PlainText}
					<input type="text" class="form-control" bind:value={object_to_assign} style="max-width: 97%;"/>
				{/if}
				{#if object_type_to_assign == ObjectType.ProofByToken}
					<select class="form-select" bind:value={object_to_assign}>
						{#each unspend_reputation_proofs as option (option.token_id)}
							{#if proof.token_id !== option.token_id}
								<option value={option.token_id}>
									{option.token_id.slice(0, 10)}
									{#if option.tag}<span class="tag">● {option.tag}</span>{/if}
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
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="form-label">Token amount<span class="required">*</span></label>
				<span style="align-self: flex-end;">Up to: {(input_proof_box.token_amount / proof.total_amount)*100}%</span>
				<input type="number" min="0" class="form-control" bind:value={reputationTokenAmount} max="{(input_proof_box.token_amount / proof.total_amount)*100}" style="max-width: 97%;"/>
			</div>

			<div class="mb-3">
                <label for="polarCheckbox" class="form-check-label">Negative</label>
                <input type="checkbox" class="form-check-input" id="polarCheckbox" bind:checked={negative} />
            </div>

			<div class="mb-3">
				<label for="data" class="form-label">Opinion about it</label>
				<JsonInput bind:value={data} style="max-width: 97%;" />
			</div>
			
		{/if}
		</form>
		<hr />
		<!-- svelte-ignore a11y-autofocus -->
		<div class="row">
			<button on:click={generateReputationProof} 
				disabled={!reputationTokenAmount || !input_proof_box}>
				Generate proof
			</button>
		</div>
	</div>
</dialog>
  
<style>
    dialog {
        max-width: 100rem;
        border-radius: 1em;
        padding: 1.5em;
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

    hr {
        border: none;
        border-top: 1px solid #444;
        margin: 1em 0;
    }

    .mb-3 {
        margin-bottom: 1.5em;
    }

    .form-label {
        font-weight: bold;
        color: #ccc;
        display: block;
        margin-bottom: 0.5em;
    }

    .form-select,
    .form-control {
        width: 100%;
        padding: 0.75em;
        font-size: 1rem;
        border: 1px solid #666;
        border-radius: 6px;
        background-color: #333;
        color: #f0f0f0;
        box-sizing: border-box;
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
        color: #aaa;
    }

    .form-select {
        height: 3em;
    }

    .required {
        color: #ff8a8a;
    }

    .row {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }

    button {
        padding: 0.75em 1.5em;
        font-size: 1rem;
        background-color: #FBBF24;
        color: #fff;
        border: none;
        cursor: pointer;
        border-radius: 6px;
        font-weight: bold;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: #d87112;
    }
</style>
