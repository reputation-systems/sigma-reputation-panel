<script lang="ts">
    import { onMount } from 'svelte';
    import { generate_reputation_proof } from '$lib/generate_reputation_proof';
    import { types, proofs, proof_by_token_type_nft_id } from '$lib/store';
    import { fetchTypeNfts } from '$lib/unspent_proofs';
        
    // --- WIZARD STATE ---
    let currentStep = 1;
    const totalSteps = 5;

    // --- FORM DATA ---
    let type_nft_id: string = ''; 
    let object_to_assign: string = '';
    let token_amount: number = 100;
    let is_negative: boolean = false;
    let data: object|string|null = null; // Can be an object, a string, or null
    let is_locked: boolean = false;
    let contentString: string = ''; // Bound to the textarea, can hold any text

    // --- UI STATE ---
    let isLoading = false;
    let errorMessage = '';
    let successMessage = '';
    let isTypesLoading = true;

    onMount(async () => {
        isTypesLoading = true;
        await fetchTypeNfts(); 
        isTypesLoading = false;
    });
    
    function nextStep() { if (currentStep < totalSteps) currentStep++; }
    function prevStep() { if (currentStep > 1) currentStep--; }

    async function handleSubmit() {
        isLoading = true;
        errorMessage = '';
        successMessage = '';
        
        if (!type_nft_id || !object_to_assign || token_amount <= 0) {
            errorMessage = "Please fill in all required fields: Type NFT Standard, Object Pointer, and Token Amount.";
            isLoading = false;
            return;
        }

        try {
            // The 'data' variable now correctly holds a string, an object, or null
            const txId = await generate_reputation_proof(
                token_amount,
                token_amount,
                type_nft_id,
                object_to_assign,
                !is_negative,
                data,
                is_locked,
                undefined
            );

            if (txId) {
                successMessage = `New reputation proof minted! Transaction ID: ${txId}`;
            } else {
                errorMessage = 'Transaction was submitted, but no transaction ID was returned.';
            }
        } catch (e: any) {
            errorMessage = `Error sending transaction: ${e.message || e.info || 'Unknown error. Check the console.'}`;
            console.error(e);
        } finally {
            isLoading = false;
        }
    }

    // Reactive statement to update 'data' based on 'contentString'
    $: {
        const value = contentString.trim();
        if (!value) {
            data = null;
        } else {
            try {
                // First, try to parse it as a JSON object
                data = JSON.parse(value);
            } catch (e) {
                // If parsing fails, treat it as a plain string
                data = value;
            }
        }
    }

    $: selectedType = type_nft_id ? $types.get(type_nft_id) : null;
    $: isReputationProofType = selectedType?.tokenId === $proof_by_token_type_nft_id;

</script>

<div class="wizard-container">
    <h2>Create New Reputation Proof</h2>
    <div class="progress-bar">
        <div class="progress-bar-fill" style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%" />
    </div>
    
    <div class="step-content">
        {#if currentStep === 1}
            <h4>Step 1: Choose Proof Standard</h4>
            <label for="type-nft-select">Type NFT Standard<span class="required">*</span></label>
            <select id="type-nft-select" class="input" bind:value={type_nft_id} required disabled={isTypesLoading}>
                <option value="" disabled selected>
                    {#if isTypesLoading}Loading types...{:else}-- Please choose a standard --{/if}
                </option>
                {#if !isTypesLoading}
                    {#each Array.from($types.values()) as type (type.tokenId)}
                        <option value={type.tokenId}>
                            {type.typeName} (v{type.version})
                        </option>
                    {/each}
                {/if}
            </select>
            {#if !isTypesLoading && $types.size === 0}
                <p class="help-text error-text">No types found. Please go to "Manage Types" to create one first.</p>
            {/if}
            {#if selectedType}
                 <p class="help-text">{selectedType.description}</p>
            {/if}
        {/if}

        {#if currentStep === 2}
            <h4>Step 2: Define First Pointer</h4>
            {#if isReputationProofType}
                <label for="proof-select">Select an Existing Proof to Point To<span class="required">*</span></label>
                <select id="proof-select" class="input" bind:value={object_to_assign} required>
                    <option value="" disabled>-- Choose one of your proofs --</option>
                    {#each Array.from($proofs.values()) as proof (proof.token_id)}
                        <option value={proof.token_id}>
                            {proof.type.typeName} (ID: {proof.token_id.substring(0, 10)}...)
                        </option>
                    {/each}
                </select>
                {#if $proofs.size === 0}
                    <p class="help-text error-text">You do not own any reputation proofs to point to.</p>
                {/if}
            {:else}
                <label for="object-assign-input">Object to Evaluate<span class="required">*</span></label>
                <input id="object-assign-input" type="text" class="input" bind:value={object_to_assign} placeholder="URL, another token ID, text, etc." required />
            {/if}
        {/if}

        {#if currentStep === 3}
            <h4>Step 3: Set Initial Tokens & Opinion</h4>
            <label for="token-amount">Amount of Tokens to Mint<span class="required">*</span></label>
            <input id="token-amount" type="number" class="input" bind:value={token_amount} min="1" step="1" />
            <div class="polarity-buttons">
                <button class:selected={!is_negative} on:click={() => is_negative = false}>👍 Positive</button>
                <button class:selected={is_negative} on:click={() => is_negative = true}>👎 Negative</button>
            </div>
        {/if}

        {#if currentStep === 4}
            <h4>Step 4: Add Content (Optional)</h4>
            <label for="content-data">Additional Data (Plain Text or JSON):</label>
            <textarea 
                id="content-data" 
                class="input" 
                rows="15" 
                bind:value={contentString}
                placeholder="Enter plain text or a valid JSON object..."
            />
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="lock-checkbox" bind:checked={is_locked} />
                <label for="lock-checkbox" class="form-check-label">Lock this first box (make it immutable)</label>
            </div>
        {/if}

        {#if currentStep === 5}
            <h4>Step 5: Summary and Submit</h4>
            <div class="summary">
                <p><strong>Standard (Type NFT):</strong> <span>{selectedType?.typeName ?? 'Unknown Type'}</span></p>
                <p><strong>Initial Pointer:</strong> <span>{object_to_assign}</span></p>
                <p><strong>Opinion:</strong> {is_negative ? 'Negative' : 'Positive'} ({token_amount.toLocaleString()} tokens to mint)</p>
                <p><strong>Content:</strong> <span>{contentString || 'Not provided'}</span></p>
                <p><strong>Will be locked:</strong> {is_locked ? 'Yes' : 'No'}</p>
            </div>
            {#if isLoading}
                <div class="feedback loading">Sending transaction... Please check your wallet.</div>
            {:else if successMessage}
                <div class="feedback success">{successMessage}</div>
            {:else if errorMessage}
                <div class="feedback error">{errorMessage}</div>
            {/if}
            <button class="submit-button" on:click={handleSubmit} disabled={isLoading || !!successMessage}>
                Sign and Mint Proof
            </button>
        {/if}
    </div>

    <div class="wizard-nav">
        <button on:click={prevStep} disabled={currentStep === 1}>&larr; Previous</button>
        <button on:click={nextStep} disabled={currentStep === 5 || !type_nft_id}>Next &rarr;</button>
    </div>
</div>

<style>
    .error-text {
        color: #ff8a8a !important;
    }
    .wizard-container { 
        max-width: 1200px; 
        margin: 2rem auto; 
        background: #2a2a2a; 
        padding: 2rem; 
        border-radius: 12px; 
        border: 1px solid #444; 
    }
    h2, h4 { text-align: center; color: #FBBF24; margin-bottom: 1rem; }
    .progress-bar { width: 100%; background-color: #555; border-radius: 5px; height: 10px; margin-bottom: 2rem; }
    .progress-bar-fill { height: 100%; background-color: #FBBF24; border-radius: 5px; transition: width 0.3s; }
    .step-content { min-height: 250px; display: flex; flex-direction: column; gap: 1rem; }
    .input, select, label { display: block; width: 100%; box-sizing: border-box; }
    label { margin-bottom: 0.25rem; font-weight: bold; color: #ccc; }
    .input, select { padding: 0.75rem; background: #333; border: 1px solid #666; border-radius: 6px; color: #f0f0f0; font-family: inherit; font-size: 1rem; }
    select:disabled { background-color: #444; cursor: not-allowed; }
    .help-text { font-size: 0.9rem; color: #aaa; margin-top: 0.75rem; border-left: 3px solid #FBBF24; padding-left: 1rem; }
    .polarity-buttons { display: flex; gap: 1rem; margin: 1rem 0; }
    .polarity-buttons button { flex-grow: 1; padding: 1rem; background: #444; border: 2px solid #666; color: white; border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
    .polarity-buttons button.selected { border-color: #FBBF24; }
    .summary { background: #333; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; word-break: break-all; max-height: 250px; overflow-y: auto;}
    .summary p { margin: 0.5rem 0; color: #ccc;}
    .summary span { color: #f0f0f0; font-family: monospace; white-space: pre-wrap; }
    .feedback { padding: 1rem; border-radius: 6px; margin: 1rem 0; text-align: center; color: white; }
    .feedback.loading { background-color: rgba(59, 89, 152, 0.8); }
    .feedback.success { background-color: rgba(76, 175, 80, 0.8); }
    .feedback.error { background-color: rgba(244, 67, 54, 0.8); }
    .wizard-nav { display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid #444; padding-top: 1rem; }
    .wizard-nav button, .submit-button { padding: 0.75rem 1.5rem; border: none; color: #1a1a1a; background: #FBBF24; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .wizard-nav button:disabled, .submit-button:disabled { background-color: #555; color: #888; cursor: not-allowed; }
    .form-check { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; }
    .form-check-input { width: 1.25em; height: 1.25em; }
    .required { color: #ff8a8a; margin-left: 4px; }
</style>