<script lang="ts">
    import { generate_reputation_proof } from '$lib/generate_reputation_proof';
        
    // --- WIZARD STATE ---
    let currentStep = 1;
    const totalSteps = 5;

    // --- STATE VARIABLES FOR MINTING A NEW PROOF ---
    // Step 1: The user must provide the ID of the Type NFT that will define this new proof.
    let type_nft_id: string = '';
    
    // Step 2: The first object this proof will point to.
    let object_to_assign: string = '';

    // Step 3: Initial token amount and opinion. For minting, tokenAmount is also the total_supply.
    let token_amount: number = 100;
    let is_negative: boolean = false;
    
    // Step 4: Additional data for R9 and lock status for R6.
    let data: object = {};
    let is_locked: boolean = false;
    let jsonDataString: string = '{}'; // Intermediate variable for textarea binding

    // --- UI STATE ---
    let isLoading = false;
    let errorMessage = '';
    let successMessage = '';
    
    // --- WIZARD NAVIGATION ---
    function nextStep() { if (currentStep < totalSteps) currentStep++; }
    function prevStep() { if (currentStep > 1) currentStep--; }

    // --- SUBMIT LOGIC (Refactored for Minting) ---
    async function handleSubmit() {
        isLoading = true;
        errorMessage = '';
        successMessage = '';
        
        // Basic validation
        if (!type_nft_id || !object_to_assign || token_amount <= 0) {
            errorMessage = "Please fill in all required fields: Type NFT ID, Object Pointer, and Token Amount.";
            isLoading = false;
            return;
        }

        try {
            // The call to generate_reputation_proof is now correctly structured for minting a new proof.
            const txId = await generate_reputation_proof(
                token_amount,
                token_amount,       // For a new proof, total_supply equals the initial token_amount.
                type_nft_id,
                object_to_assign,
                !is_negative,       // Convert checkbox state to the 'polarization' parameter.
                data,
                is_locked,
                undefined           // No input_proof is provided when minting.
            );

            if (txId) {
                successMessage = `New reputation proof minted! Transaction ID: ${txId}`;
                // Optionally, trigger a data refresh here.
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
</script>

<div class="wizard-container">
    <h2>Create New Reputation Proof</h2>
    <div class="progress-bar">
        <div class="progress-bar-fill" style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%" />
    </div>
    
    <div class="step-content">
        {#if currentStep === 1}
            <h4>Step 1: Choose Proof Standard</h4>
            <label for="type-nft-id-input">Type NFT ID<span class="required">*</span></label>
            <input id="type-nft-id-input" type="text" class="input" bind:value={type_nft_id} placeholder="Paste the token ID of the Type NFT" />
            <p class="help-text">This NFT defines the rules and meaning for your new proof.</p>
        {/if}

        {#if currentStep === 2}
            <h4>Step 2: Define First Pointer</h4>
            <label for="object-assign-input">Object to Evaluate<span class="required">*</span></label>
            <input id="object-assign-input" type="text" class="input" bind:value={object_to_assign} placeholder="URL, another token ID, text, etc." />
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
            <label for="json-data">Additional Data (in JSON format):</label>
            <textarea 
                id="json-data" 
                class="input" 
                rows="5" 
                bind:value={jsonDataString} 
                on:input={(e) => { try { data = JSON.parse(e.currentTarget.value) } catch {} }}
            />
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="lock-checkbox" bind:checked={is_locked} />
                <label for="lock-checkbox" class="form-check-label">Lock this first box (make it immutable)</label>
            </div>
        {/if}

        {#if currentStep === 5}
            <h4>Step 5: Summary and Submit</h4>
            <div class="summary">
                <p><strong>Standard (Type NFT):</strong> <span>{type_nft_id.slice(0, 25)}...</span></p>
                <p><strong>Initial Pointer:</strong> <span>{object_to_assign}</span></p>
                <p><strong>Opinion:</strong> {is_negative ? 'Negative' : 'Positive'} ({token_amount.toLocaleString()} tokens to mint)</p>
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
        <button on:click={nextStep} disabled={currentStep === 5}>Next &rarr;</button>
    </div>
</div>

<style>
    .wizard-container { max-width: 700px; margin: 2rem auto; background: #2a2a2a; padding: 2rem; border-radius: 12px; border: 1px solid #444; }
    h2, h4 { text-align: center; color: #FBBF24; margin-bottom: 1rem; }
    .progress-bar { width: 100%; background-color: #555; border-radius: 5px; height: 10px; margin-bottom: 2rem; }
    .progress-bar-fill { height: 100%; background-color: #FBBF24; border-radius: 5px; transition: width 0.3s; }
    .step-content { min-height: 250px; display: flex; flex-direction: column; gap: 1rem; }
    .input, label { display: block; width: 100%; box-sizing: border-box; }
    label { margin-bottom: 0.25rem; font-weight: bold; color: #ccc; }
    .input { padding: 0.75rem; background: #333; border: 1px solid #666; border-radius: 6px; color: #f0f0f0; }
    .help-text { font-size: 0.8rem; color: #888; margin-top: 0.5rem; }
    .polarity-buttons { display: flex; gap: 1rem; margin: 1rem 0; }
    .polarity-buttons button { flex-grow: 1; padding: 1rem; background: #444; border: 2px solid #666; color: white; border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
    .polarity-buttons button.selected { border-color: #FBBF24; }
    .summary { background: #333; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; word-break: break-all; }
    .summary p { margin: 0.5rem 0; }
    .summary span { color: #f0f0f0; font-family: monospace; }
    .feedback { padding: 1rem; border-radius: 6px; margin: 1rem 0; text-align: center; }
    .feedback.loading { background-color: #3b5998; }
    .feedback.success { background-color: #4caf50; }
    .feedback.error { background-color: #f44336; }
    .wizard-nav { display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid #444; padding-top: 1rem; }
    .wizard-nav button, .submit-button { padding: 0.75rem 1.5rem; border: none; color: #1a1a1a; background: #FBBF24; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .wizard-nav button:disabled, .submit-button:disabled { background-color: #555; color: #888; cursor: not-allowed; }
    .form-check { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; }
    .form-check-input { width: 1.25em; height: 1.25em; }
    .required { color: #ff8a8a; margin-left: 4px; }
</style>