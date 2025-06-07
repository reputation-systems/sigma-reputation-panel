<script lang="ts">
    import { searchStore, show_header } from "$lib/store";
</script>

<div>
  {#if $searchStore}
    <br>
    <!-- svelte-ignore a11y-missing-attribute -->
    <a style="background-color: aliceblue; display:inline-block;">Search: {$searchStore}</a>
  {/if}  
  </div>

<style>
  .github-button {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999;

    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #333; 
    color: #f0f0f0; 
    border-radius: 50%; 
    border: 1px solid #555;
    font-size: 1.5rem;
    text-decoration: none;
    transition: background-color 0.2s, transform 0.2s;
  }

  .github-button:hover {
    background-color: #444;
    transform: scale(1.1);
    color: #fff;
  }
</style>
