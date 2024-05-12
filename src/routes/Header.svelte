<script lang="ts">
  export let zen_mode: boolean;
  export let search: string;
</script>

<div>
  {#if zen_mode}
    <!--  -->
  {:else}
    <h1 style="background-color: aliceblue; display:inline-block;">Welcome to the Sigma Reputation Panel</h1>
  
    <a class="github-button" href="https://github.com/reputation-systems/sigma-reputation-panel" target="_blank">
      <img src="https://cdn.icon-icons.com/icons2/844/PNG/512/Github_icon-icons.com_67091.png" alt="GitHub" width="50" height="50">
    </a>  
  {/if}
  {#if search}
    <br>
    <!-- svelte-ignore a11y-missing-attribute -->
    <a style="background-color: aliceblue; display:inline-block;">Search: {search}</a>
  {/if}  
  </div>

 <style>
    .github-button {
      position: fixed;
      top: 20px; /* Ajusta la posición vertical según tu preferencia */
      right: 20px; /* Ajusta la posición horizontal según tu preferencia */
      z-index: 999;
    }
  </style>