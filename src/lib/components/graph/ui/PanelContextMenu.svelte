<script lang="ts">

    import SettingModal from "./Settings.svelte";
    import Search from "./Search.svelte";
    import { connected } from "$lib/store";
    
    // pos is cursor position when right click occur
    let pos = { x: 0, y: 0 }
    // menu is dimension (height and width) of context menu
    let menu = { h: 0, y: 0 }
    // browser/window dimension (height and width)
    let browser = { h: 0, y: 0 }
    let showMenu = false;
    let showSearch = false;
    let showSetting = false;


    function rightClickContextMenu(e){
        showMenu = true
        browser = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        pos = {
            x: e.clientX,
            y: e.clientY
        };
        // If bottom part of context menu will be displayed
        // after right-click, then change the position of the
        // context menu. This position is controlled by `top` and `left`
        // at inline style. 
        // Instead of context menu is displayed from top left of cursor position
        // when right-click occur, it will be displayed from bottom left.
        if (browser.h -  pos.y < menu.h)
            pos.y = pos.y - menu.h
        if (browser.w -  pos.x < menu.w)
            pos.x = pos.x - menu.w
    }
    function onPageClick(e){
        // To make context menu disappear when
        // mouse is clicked outside context menu
        showMenu = false;
    }
    function getContextMenuDimension(node){
        // This function will get context menu dimension
        // when navigation is shown => showMenu = true
        let height = node.offsetHeight
        let width = node.offsetWidth
        menu = {
            h: height,
            w: width
        }
    }
    function search(){
        showSearch = true;
    }
    function setting(){
        showSetting = true;
    }

    let menuItems = [
        {
            'name': 'search',
            'onClick': search,
            'displayText': "Search",
            'class': 'fa-solid fa-magnifying-glass'
        },
        {
            'name': 'hr',
        },
        {
            'name': 'settings',
            'onClick': setting,
            'displayText': "Settings",
            'class': 'fa-solid fa-gear'
        }
    ].filter(item => $connected || item.name !== 'addItem');

</script>
<svelte:head>
    <!-- You can change icon sets according to your taste. Change `class` value in `menuItems` above to represent your icons. -->
    <!-- <link rel="stylesheet" href="/icon/css/mfglabs_iconset.css"> -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

{#if showMenu}
<nav use:getContextMenuDimension style="position: absolute; top:{pos.y}px; left:{pos.x}px">
    <div class="navbar" id="navbar">
        <ul>
            {#each menuItems as item}
                {#if item.name == "hr"}
                    <hr>
                {:else}
                    <li><button on:click={item.onClick}><i class={item.class}></i>{item.displayText}</button></li>
                {/if}
            {/each}
        </ul>
    </div>
</nav>
{/if}

<svelte:window on:contextmenu|preventDefault={rightClickContextMenu} on:click={onPageClick} />

<Search bind:showSearch />
<SettingModal bind:showModal={showSetting} />


<style>
    * {
        padding: 0;
        margin: 0;
    }
    
    .navbar {
        display: inline-flex;
        border: 1px #555 solid;
        width: 250px;
        background-color: #2a2a2a;
        border-radius: 10px;
        overflow: hidden;
        flex-direction: column;
        color: #f0f0f0;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }

    .info-block {
        padding: 10px;
        margin: 6px;
        margin-bottom: 10px;
        background-color: #333;
        border: 1px solid #444;
        border-radius: 5px;
    }

    .info-block p {
        margin: 0;
        font-size: 16px;
        line-height: 1.6;
    }

    .label {
        font-weight: bold;
        color: #aaa;
    }

    .navbar ul {
        margin: 6px;
        padding: 0;
    }

    ul li {
        display: block;
        list-style-type: none;
    }

    ul li button {
        font-size: 1rem;
        color: #f0f0f0;
        width: 100%;
        height: 30px;
        text-align: left;
        border: 0;
        background-color: transparent;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.2s;
    }

    ul li button:hover {
        color: white;
        background-color: #FBBF24;
    }

    ul li button i {
        padding: 0px 15px 0px 10px;
    }

    ul li button:hover > i.warning {
        color: #ffcdd2;
    }

    :global(ul li button.info:hover) {
        color: #e3f2fd;
    }
    
    hr {
        border: none;
        border-bottom: 1px solid #444;
        margin: 5px 0px;
    }
</style>
