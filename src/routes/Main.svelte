<script lang="ts">
    import { writable } from 'svelte/store';

    export let show_app: boolean = false;
    export let search: string|null = null;
    let searchQuery = writable('');

    function search() {
        show_app = true;
        search = searchQuery;
    }
</script>

<div>
    <a class="github-button" href="https://github.com/celaut-project/ergo-reputation-system" target="_blank">
      <img src="https://cdn.icon-icons.com/icons2/844/PNG/512/Github_icon-icons.com_67091.png" alt="GitHub" width="50" height="50">
    </a> 
  </div>
  
<div class="container">
    <input type="text" placeholder="Calculate reputation for ..." bind:value={$searchQuery} on:keypress={handleKeyPress} />
</div>


<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #1A192B;
    }

    input {
        padding: 15px;
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
</style>