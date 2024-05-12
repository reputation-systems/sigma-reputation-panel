<script lang="ts">
    import { address, searchStore, network } from "$lib/store";

    const icon_route = "https://cdn0.iconfinder.com/data/icons/art-designing-glyph/2048/1871_-_Magnifier-512.png"
    let networkLogo = "https://spectrum.fi/logos/ergo/0000000000000000000000000000000000000000000000000000000000000000.svg?vMgQKXaSAo";

    export let show_app: boolean = false;
    let searchQuery: string = "";
    let showMessage = false;

    function searchOnClick() {
        show_app = true;
        searchStore.set(searchQuery);
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === "Enter") {
            searchOnClick();
        }
    }

    function copyToClipboard() {
        const textToCopy = $address ?? "";
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showMessage = true;
                setTimeout(() => {
                    showMessage = false;
                }, 5000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    }

    $: {
        if ($network === "ergo-testnet" || $network === "ergo-mainnet") {
            networkLogo = "https://spectrum.fi/logos/ergo/0000000000000000000000000000000000000000000000000000000000000000.svg?vMgQKXaSAo";
        } else {
            networkLogo = "https://placehold.it/50x50";
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if $address}
    <div class="identifier" id="walletIdentifier" on:click={copyToClipboard}>
        <p>Wallet: {($address.slice(0, 6) + '...' + $address.slice(-4))}</p>
    </div>
{/if}

<div class="network" style="display: flex; align-items: center;">
    <img src={networkLogo} alt="Network Logo" width="25" height="25">
    {#if $network}
        <p>{$network}</p>
    {/if}
</div>

{#if showMessage}
    <div class="message">
        <p>Wallet address copied to clipboard!</p>
    </div>
{/if}

<div>
    <a class="github-button" href="https://github.com/reputation-systems/sigma-reputation-panel" target="_blank">
      <img src="https://cdn.icon-icons.com/icons2/844/PNG/512/Github_icon-icons.com_67091.png" alt="GitHub" width="50" height="50">
    </a> 
</div>
  
<div class="container">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="input-wrapper">
        <input type="text" placeholder="Calculate reputation for ..." bind:value={searchQuery} on:keydown={handleKeyPress}/>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="search-icon" on:click={searchOnClick}>
            <img src={icon_route} alt="Search" width="30" height="30" style="margin-bottom: 12px;">
        </span>
    </div>
</div>


<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #1A192B;
    }

    .input-wrapper {
        position: relative;
    }

    input {
        padding: 15px 40px 15px 15px; /* Añadido espacio a la derecha para el icono */
        border-radius: 5px;
        border: none;
        outline: none;
        background-color: #fff;
        color: #333;
        font-size: 18px;
        width: 400px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-top: -50px;
    }

    .github-button {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999;
    }

    .search-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
    }

    /* Styling for identifier */
    .identifier {
        position: absolute;
        top: 20px;
        right: calc(20px + 60px); /* Adjusting for GitHub logo width */
        z-index: 998; /* Ensuring it's below GitHub logo */
        color: white;
        font-weight: bold;
        border: 2px solid white;
        padding: 5px 10px;
        border-radius: 10px;
    }

    /* Estilo para el recuadro de $network */
    .network {
        position: absolute;
        top: 20px;
        right: calc(20px + 60px + 200px); /* Adjusting for GitHub logo width and wallet identifier width */
        z-index: 997; /* Ensuring it's below wallet identifier */
        color: white;
        font-weight: bold;
        border: 2px solid white;
        padding: 5px 10px;
        border-radius: 10px;
    }

    .message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
    }

</style>
