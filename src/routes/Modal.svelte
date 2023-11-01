<script lang="ts">
	 import {
        OutputBuilder,
        SAFE_MIN_BOX_VALUE,
        RECOMMENDED_MIN_FEE_VALUE,
        TransactionBuilder
    } from '@fleet-sdk/core';

	 const explorer_uri = "https://api.ergoplatform.com";
	 const ergo_tree_template_hash = "EC591AEB578B53D7CE8BB2A0BEAB3795D187A4030D9D4C25E062AC26236F0D16"

    async function generate_reputation_proof(new_one: boolean, token_id: string, token_amount: string) {
		 // TODO add reputationRegister (it's the pointer, if exists).

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


	//  Unspent valid reputation proofs

	 let unspent_proofs = []; //  TODO upload some proofs to the testnet to learn how to use the explorer api.
	 // updateReputationProofList()
	 // Demo data
	 unspent_proofs = [
		 {
			 "id": "4kl1n34l13k4n4kn13k4ln1",
			 "blockId": "4kl1n34l13k4n4kn13k4ln1",
			 "inclusionHeight": 12,
			 "timestamp": 123123123123,
			 "index": 0,
			 "globalIndex": 0,
			 "numConfirmations": 5,
			 "inputs": [],
			 "dataInputs": [],
			 "outputs": [],
			 "size": 12334
		 },
		 {
			 "id": "AAAAAAAAADFDAFADFDAFDA",
			 "blockId": "AAAAAAAAADFDAFADFDAFDA",
			 "inclusionHeight": 12,
			 "timestamp": 123123123123,
			 "index": 0,
			 "globalIndex": 0,
			 "numConfirmations": 5,
			 "inputs": [],
			 "dataInputs": [],
			 "outputs": [],
			 "size": 12334
		 },
		 {
			 "id": "BBCFFDFBDFFDFBDFBDFBDFB",
			 "blockId": "BBCFFDFBDFFDFBDFBDFBDFB",
			 "inclusionHeight": 12,
			 "timestamp": 123123123123,
			 "index": 0,
			 "globalIndex": 0,
			 "numConfirmations": 5,
			 "inputs": [],
			 "dataInputs": [],
			 "outputs": [],
			 "size": 12334
		 },
	 ]

	async function updateReputationProofList() {
    try {
      const response = await fetch(explorer_uri+'/api/v1/boxes/unspent/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
			  "ergoTreeTemplateHash": ergo_tree_template_hash,
			  "registers": {
				"R4": await ergo.get_change_address(),
			  },
			/*  "constants": {
				"property1": "string",
				"property2": "string"
			  },
			  "assets": [
				"string"
			  ]

			 */
			}),
      });

      if (response.ok) {
        const data = await response.json(); // Suponiendo que la respuesta es un objeto JSON
		  console.log(data)
		  unspent_proofs = data.items; // Actualiza las opciones con los datos recibidos
      } else {
        console.error('Error al realizar la solicitud POST');
      }
    } catch (error) {
      console.error('Error al procesar la solicitud POST:', error);
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
						  {#each unspent_proofs as option (option.id)}
							  <option value={option.id}>{option.id}</option>
						  {/each}
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
