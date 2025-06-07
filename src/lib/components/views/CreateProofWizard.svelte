<script lang="ts">
	import { proofs } from '$lib/store';
	import { generate_reputation_proof } from '$lib/generate_reputation_proof';
	import { ObjectType, type RPBox, type ReputationProof } from '$lib/ReputationProof';
    import { type LinkedHash } from '$lib/LinkedObject';
    
    // Assuming this component exists in the same folder or an accessible path
    // import JsonInput from "./JsonInput.svelte"; // Uncomment if you have this component

    // --- WIZARD STATE ---
	let currentStep = 1;
	const totalSteps = 5;

    // --- STATE VARIABLES (Combination of Modal and Wizard) ---
	let sourceMode: 'mint' | 'split' = 'mint';
	let selectedBoxId: string | undefined = undefined; // For selecting a box in 'split' mode
	let tokenAmount: number = 100;
	let objectToAssign: string = '';
	let objectType: ObjectType = ObjectType.PlainText;
	let isNegative: boolean = false;
	let tags: string = 'reputation-proof-token';
	let data: object = {}; // We will use an object directly

    // Intermediate variable for the textarea binding
    let jsonDataString: string = '{}';

    // --- Logic specific to LinkedObject (from the original modal) ---
    let linkedHashes: LinkedHash[] = [{ algorithm: null, value: '' }];
    const baseHashes = {
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': 'SHA2 256',
        'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a': 'SHA3 256',
        '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f': 'SHAKE 256'
    };
    function addNewHash() { linkedHashes = [...linkedHashes, { algorithm: null, value: '' }]; }
    function removeHash(index: number) { linkedHashes = linkedHashes.filter((_, i) => i !== index); }


    // --- UI STATE ---
	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';

    // --- DERIVED DATA ---
	$: spendableBoxes = [...$proofs.values()].filter((p) => p.can_be_spend).flatMap((p) => p.current_boxes);
	$: selectedBox = spendableBoxes.find((box) => box.box_id === selectedBoxId);
    
    // Reset `objectToAssign` when the type changes to prevent inconsistent data
    $: if(objectType) {
        objectToAssign = '';
    }

    // --- WIZARD NAVIGATION ---
    function nextStep() { if (currentStep < totalSteps) currentStep++; }
    function prevStep() { if (currentStep > 1) currentStep--; }

    // --- SUBMIT LOGIC (CORRECTED) ---
    async function handleSubmit() {
        isLoading = true;
        errorMessage = '';
        successMessage = '';
        
        // Temporary variable for the object to be assigned
        let finalObjectToAssign = objectToAssign;

        // We prepare the data correctly, just like in the original modal
        if (objectType === ObjectType.LinkedObject) {
            // Filter only valid hashes and convert them to JSON
            finalObjectToAssign = JSON.stringify(
                linkedHashes.filter(item => typeof item.algorithm === "string" && item.value.length > 0)
            );
        }

        try {
            const txId = await generate_reputation_proof(
                tokenAmount,
                selectedBox,          // The input_proof (can be undefined)
                finalObjectToAssign,  // The object to assign, correctly prepared
                objectType,           // The object type
                isNegative,
                tags,
                data                  // The additional data object
            );

            if (txId) {
                successMessage = `Reputation proof sent! Transaction ID: ${txId}`;
            } else {
                errorMessage = 'Transaction was sent, but no transaction ID was received.';
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
    <div class="progress-bar"><div class="progress-bar-fill" style="width: {(currentStep / totalSteps) * 100}%" /></div>
    
    <div class="step-content">
        <!-- Step 1: Source -->
        {#if currentStep === 1}
            <h4>Step 1: Token Source</h4>
            <div class="radio-group">
                <label><input type="radio" bind:group={sourceMode} value="mint"> Mint New Token</label>
                {#if spendableBoxes.length > 0}
                <label><input type="radio" bind:group={sourceMode} value="split"> Use Existing Token (Split)</label>
                {/if}
            </div>
            {#if sourceMode === 'split'}
                <select class="input" bind:value={selectedBoxId}>
                    <option disabled selected value={undefined}>-- Choose one of your boxes --</option>
                    {#each spendableBoxes as box (box.box_id)}
                        <option value={box.box_id}>Box {box.box_id.substring(0, 8)}... ({box.token_amount} tokens)</option>
                    {/each}
                </select>
            {/if}
        {/if}

        <!-- Step 2: Object to Evaluate (with logic from the modal) -->
        {#if currentStep === 2}
            <h4>Step 2: Object to Evaluate</h4>
            <label for="object-type">Object Type:</label>
			<select id="object-type" class="input" bind:value={objectType}>
				<option value={ObjectType.PlainText}>Simple Text</option>
				<option value={ObjectType.ProofByToken}>Another Reputation Proof</option>
				<option value={ObjectType.LinkedObject}>Linked Object (Hashes)</option>
			</select>
            
            <!-- Interface for each object type -->
            {#if objectType == ObjectType.PlainText}
                <label for="plain-text-input">Content:</label>
                <input id="plain-text-input" type="text" class="input" bind:value={objectToAssign} placeholder="URL, text, etc." />
            {/if}
            {#if objectType == ObjectType.ProofByToken}
                <label for="proof-select">Proof to reference:</label>
                <select id="proof-select" class="input" bind:value={objectToAssign}>
                    <option disabled selected value="">-- Choose a proof --</option>
                    {#each [...$proofs.values()] as p (p.token_id)}
                        {#if !selectedBox || p.token_id !== selectedBox.token_id}
                            <option value={p.token_id}>{p.tag || p.token_id.slice(0,15)}...</option>
                        {/if}
                    {/each}
                </select>
            {/if}
            {#if objectType === ObjectType.LinkedObject}
                <div class="linked-hashes">
                    {#each linkedHashes as hash, i}
                    <div class="hash-pair">
                        <select class="input" bind:value={hash.algorithm}>
                            <option value={null}>Algorithm</option>
                            {#each Object.entries(baseHashes) as [hashValue, name]}
                                <option value={hashValue}>{name}</option>
                            {/each}
                        </select>
                        <input type="text" class="input" placeholder="Hash Value" bind:value={hash.value} />
                        <button type="button" class="remove-btn" on:click={() => removeHash(i)}>–</button>
                    </div>
                    {/each}
                    <button type="button" class="add-btn" on:click={addNewHash}>+ Add Hash</button>
                </div>
            {/if}
        {/if}

        <!-- Step 3: Opinion and Amount -->
        {#if currentStep === 3}
            <h4>Step 3: Your Opinion</h4>
            <div class="polarity-buttons">
                <button class:selected={!isNegative} on:click={() => isNegative = false}>👍 Positive</button>
                <button class:selected={isNegative} on:click={() => isNegative = true}>👎 Negative</button>
            </div>
            <label for="token-amount">Amount of Tokens to assign:</label>
            <input id="token-amount" type="number" class="input" bind:value={tokenAmount} min="1" max={selectedBox ? selectedBox.token_amount : undefined} step="1" />
        {/if}

        <!-- Step 4: Metadata -->
        {#if currentStep === 4}
            <h4>Step 4: Metadata (Optional)</h4>
            <label for="tags-input">Tags (comma-separated):</label>
            <input id="tags-input" class="input" bind:value={tags} placeholder="e.g., defi, safe, project">
            <label for="json-data">Additional Data (in JSON format):</label>
            
            <!-- CORRECTION: The textarea is now a self-closing tag to prevent the error. -->
            <textarea 
                id="json-data" 
                class="input" 
                rows="4" 
                bind:value={jsonDataString} 
                on:input={(e) => { try { data = JSON.parse(e.currentTarget.value) } catch {} }}
            />
        {/if}

        <!-- Step 5: Summary -->
        {#if currentStep === 5}
            <h4>Step 5: Summary and Submit</h4>
            <div class="summary">
                <p><strong>Source:</strong> {sourceMode === 'mint' ? 'Mint New Token' : `Split box ${selectedBoxId?.substring(0,8)}...`}</p>
                <p><strong>Object Type:</strong> {objectType}</p>
                <p><strong>Opinion:</strong> {isNegative ? 'Negative' : 'Positive'} ({tokenAmount.toLocaleString()} tokens)</p>
            </div>
            {#if isLoading}<div class="feedback loading">Sending transaction... Please check your wallet.</div>{:else if successMessage}<div class="feedback success">{successMessage}</div>{:else if errorMessage}<div class="feedback error">{errorMessage}</div>{/if}
            <button class="submit-button" on:click={handleSubmit} disabled={isLoading || !!successMessage}>Sign and Send</button>
        {/if}
    </div>

    <div class="wizard-nav">
        <button on:click={prevStep} disabled={currentStep === 1}>&larr; Previous</button>
        <button on:click={nextStep} disabled={currentStep === 5}>Next &rarr;</button>
    </div>
</div>

<style>
    /* The styles you already had are perfect, we keep them */
    .wizard-container { max-width: 700px; margin: 2rem auto; background: #2a2a2a; padding: 2rem; border-radius: 12px; border: 1px solid #444; }
    h2, h4 { text-align: center; color: #FBBF24; margin-bottom: 1rem; }
    .progress-bar { width: 100%; background-color: #555; border-radius: 5px; height: 10px; margin-bottom: 2rem; }
    .progress-bar-fill { height: 100%; background-color: #FBBF24; border-radius: 5px; transition: width 0.3s; }
    .step-content { min-height: 250px; }
    .input, .radio-group, label { display: block; width: 100%; margin-top: 1rem; box-sizing: border-box; }
    .input { padding: 0.75rem; background: #333; border: 1px solid #666; border-radius: 6px; color: #f0f0f0; }
    input[type="range"] { width: 100%; }
    .polarity-buttons { display: flex; gap: 1rem; margin: 1rem 0; }
    .polarity-buttons button { flex-grow: 1; padding: 1rem; background: #444; border: 2px solid #666; color: white; border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
    .polarity-buttons button.selected { border-color: #FBBF24; }
    .summary { background: #333; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; word-break: break-all; }
    .feedback { padding: 1rem; border-radius: 6px; margin: 1rem 0; text-align: center; }
    .feedback.loading { background-color: #3b5998; } .feedback.success { background-color: #4caf50; } .feedback.error { background-color: #f44336; }
    .wizard-nav { display: flex; justify-content: space-between; margin-top: 2rem; border-top: 1px solid #444; padding-top: 1rem; }
    .wizard-nav button, .submit-button { padding: 0.75rem 1.5rem; border: none; color: white; background: #FBBF24; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .wizard-nav button:disabled { background-color: #555; cursor: not-allowed; }

    /* Styles for LinkedObject */
    .linked-hashes { margin-top: 1rem; }
    .hash-pair { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
    .remove-btn, .add-btn { background-color: #555; padding: 0.5rem; font-size: 1rem; width: 40px; text-align: center; }
    .add-btn { width: 100%; margin-top: 0.5rem; }
</style>
