<script lang="ts">

    import FormModal from "./CreateProofModal.svelte";
    import SettingModal from "./Settings.svelte";
    import Search from "./Search.svelte";
    
    // pos is cursor position when right click occur
    let pos = { x: 0, y: 0 }
    // menu is dimension (height and width) of context menu
    let menu = { h: 0, y: 0 }
    // browser/window dimension (height and width)
    let browser = { h: 0, y: 0 }
    let showMenu = false;
    let showSearch = false;
    let showForm = false;
    let showSetting = false;
    export let setter: CallableFunction;


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
    function addItem(){
        showForm = true
    }
    function search(){
        showSearch = true;
    }
    function setting(){
        console.log("open setting")
        showSetting = true;
    }
    let menuItems = [
        {
            'name': 'addItem',
            'onClick': addItem,
            'displayText': "New",
            'class': 'fa-solid fa-bullhorn'
        },
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
    ]

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

<FormModal bind:showModal={showForm} />
<Search bind:showSearch />
<SettingModal bind:showModal={showSetting} bind:setter />


<style>
    * {
        padding: 0;
        margin: 0;
    }
    .navbar{
        display: inline-flex;
        border: 1px #999 solid;
        width: 170px;
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        flex-direction: column;
    }
    .navbar ul{
        margin: 6px;
    }
    ul li{
        display: block;
        list-style-type: none;
        width: 1fr;
    }
    ul li button{
        font-size: 1rem;
        color: #222;
        width: 100%;
        height: 30px;
        text-align: left;
        border: 0px;
        background-color: #fff;
    }
    ul li button:hover{
        color: #000;
        text-align: left;
        border-radius: 5px;
        background-color: #eee;
    }
    ul li button i{
        padding: 0px 15px 0px 10px;
    }
    ul li button i.fa-square{
        color: #fff;
    }
    ul li button:hover > i.fa-square{
        color: #eee;
    }
    ul li button:hover > i.warning{
        color: crimson;
    }
    :global(ul li button.info:hover){
        color: navy;
    }
    hr{
        border: none;
        border-bottom: 1px solid #ccc;
        margin: 5px 0px;
    }
</style>