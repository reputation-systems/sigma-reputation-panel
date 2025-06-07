<script lang="ts">
    import { type LinkedObject } from "$lib/LinkedObject";


  import { data_store } from "$lib/store";

  export let onClick: () => void;



    export let linked_object: LinkedObject;
  

  // pos is cursor position when right click occur
  let pos = { x: 0, y: 0 }
  // menu is dimension (height and width) of context menu
  let menu = { h: 0, y: 0 }
  // browser/window dimension (height and width)
  let browser = { h: 0, y: 0 }
  let showMenu = false;
  let showForm = false;
  let showComputeSearch = false;


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
      onClick()
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

  function handleDblClick() {
    data_store.set(linked_object);
  }

    let menuItems = [
        {
            name: "openInfo",
            onClick: handleDblClick,
            displayText: "Details",
            class: "fa-solid fa-info"
        }
    ];


</script>
<svelte:head>
  <!-- You can change icon sets according to your taste. Change `class` value in `menuItems` above to represent your icons. -->
  <!-- <link rel="stylesheet" href="/icon/css/mfglabs_iconset.css"> -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

{#if showMenu}
<nav use:getContextMenuDimension style="position: absolute; top:{pos.y}px; left:{pos.x}px">
  <div class="navbar" id="navbar">
    <div class="info-block">
      <p>
          This is a linked object. Its information can vary between each reputation proof that points to it.
      </p>
  </div>  
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

<svelte:window 
  on:contextmenu|preventDefault={showMenu ? onPageClick : rightClickContextMenu}
  on:wheel|preventDefault={onPageClick}
  on:dblclick|preventDefault={onPageClick}  
/> 

<style>
    /* Estilos para el contenedor principal del menú */
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

    /* Estilos para el bloque de información en la parte superior del menú */
    .info-block {
        padding: 10px;
        margin: 6px;
        margin-bottom: 0;
        background-color: #333;
        border-bottom: 1px solid #444;
        border-radius: 5px 5px 0 0;
    }

    .info-block p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    .label {
        font-weight: bold;
        color: #aaa;
    }

    /* Estilos para los enlaces dentro del bloque de información */
    .info-block a {
        color: #ccc;
        text-decoration: none;
    }

    /* Estilos para la lista de opciones del menú */
    .navbar ul {
        margin: 6px;
        padding: 0;
    }

    ul li {
        display: block;
        list-style-type: none;
    }

    /* Estilos para los botones de las opciones del menú */
    ul li button {
        font-size: 1rem;
        color: #f0f0f0;
        width: 100%;
        padding: 0;
        height: 32px;
        text-align: left;
        border: 0;
        background-color: transparent;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: background-color 0.2s, color 0.2s;
    }

    ul li button:hover {
        background-color: #FBBF24;
        color: white;
    }

    /* Estilos para los iconos dentro de los botones */
    ul li button i {
        padding: 0 15px 0 10px;
        width: 18px;
        text-align: center;
        margin-right: 5px;
    }

    ul li button:hover > i.warning {
        color: #ffcdd2; /* Rojo claro para advertencias en hover */
    }

    :global(ul li button.info:hover) {
        color: #e3f2fd; /* Azul claro para info en hover */
    }

    /* Estilo para el separador horizontal */
    hr {
        border: none;
        border-bottom: 1px solid #444;
        margin: 5px 0;
    }
</style>
