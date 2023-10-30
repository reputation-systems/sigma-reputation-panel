<script lang="ts">
	 import {
        OutputBuilder,
        SAFE_MIN_BOX_VALUE,
        RECOMMENDED_MIN_FEE_VALUE,
        TransactionBuilder
    } from '@fleet-sdk/core';

    async function generate_reputation_proof(new_one: boolean, token_id: string, token_amount: string) {
        /*
              Once the connection request is accepted by the user, this API will be injected in the same
              way as the Connection API, and you can interact with it through the ergo object.
         */
        console.log("new one ", new_one, "   token id ", token_id, "   token_amount", token_amount)

        const wallet_pk = await ergo.get_change_address();

        const token_label: string = wallet_pk + ergo.get_current_height().toString();
        const builder = new OutputBuilder(
          SAFE_MIN_BOX_VALUE,
          wallet_pk
        );

        if (new_one) {
          // https://fleet-sdk.github.io/docs/transaction-building#step-4-2-mint-a-token
          builder.mintToken({
            amount: token_amount, // the amount of tokens being minted without decimals
            name: "rt-" + token_label, // the name of the token
            decimals: 0, // the number of decimals
            description: "Reputation token "  + token_label + " of the wallet " + wallet_pk
          })
        } else {
          // https://fleet-sdk.github.io/docs/transaction-building#step-4-1-add-tokens
          builder.addTokens({
            tokenId: token_id,
            amount: token_amount
          }, {sum: false})
        }

        // TODO assign the contract.
        const unsignedTransaction = await new TransactionBuilder(await ergo.get_current_height())
          .from(await ergo.get_utxos()) // add inputs
          .to(builder)
          .sendChangeTo(wallet_pk) // set change address
          .payFee(RECOMMENDED_MIN_FEE_VALUE)
          .build() // build!
          .toEIP12Object();

		console.log(unsignedTransaction)

        const signedTransaction = await ergo.sign_tx(unsignedTransaction);
        const transactionId = await ergo.submit_tx(signedTransaction);
        console.log("transaction id -> ", transactionId)
    }


	export let showModal; // boolean

	let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();

	let selectedOption = "";

	function handleSelectChange(event) {
		selectedOption = event.target.value;
	}

	let reputationTokenAmount;
	let reputationRegister;
	let reputationProof;
	let data_amount_free;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<h2 class="modal-title" id="generateReputationLabel">Generate new reputation proof</h2>
		<hr />
		<form id="reputationForm">
		  <div class="mb-3">
			<label class="form-label">Choose an option</label>
			<select class="form-select" bind:value={selectedOption} on:change={handleSelectChange}>
			  <option></option>
			  <option value="new">A new one</option>
			  <option value="another">From another reputation prove</option>
			</select>
		  </div>
		  <div>
			  {#if selectedOption === "new"}
				  <div class="mb-3">
					  <label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>
					  <input type="number" class="form-control" bind:value={reputationTokenAmount}/>
				  </div>
			  {/if}
			  {#if selectedOption === "another"}
				  <div class="mb-3">
					  <label class="form-label">Reputation proof</label>
					  <select class="form-select" bind:value={reputationProof}>' +
						  <option></option>  <!-- TODO add an explorer query to get reputation proofs. -->
					  </select>
				  </div>
				  <div class="mb-3">
					  <label for="reputationToken" class="form-label">Token amount<span class="required">*</span></label>
					  <input type="number" class="form-control" bind:value={reputationTokenAmount} max="{data_amount_free}"/>
				  </div>
			  {/if}
			  {#if selectedOption !== ""}
				  <div class="mb-3">
					  <label for="reputationRegister" class="form-label">Object to assign reputation</label>
					  <input type="text" class="form-control" bind:value={reputationRegister}/>
				  </div>
			  {/if}
		  </div>
		</form>
		<hr />
		<!-- svelte-ignore a11y-autofocus -->
		<div class="row">
			<!-- <button autofocus on:click={() => dialog.close()}>x</button> -->
			<button on:click={() => generate_reputation_proof(
					selectedOption==="new",
					reputationProof,
					reputationTokenAmount
			)}>Generate proof</button>
		</div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
