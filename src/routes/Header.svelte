<script lang="ts">
  export let zen_mode: boolean;
</script>

<div>
  {#if zen_mode}
    <div style="background-color: white; border-radius: 50%; display: inline-block; padding: 10px;">
      <h1 style="margin: 0;">Σ</h1>
    </div>
  {:else}
    <h1 style="background-color: aliceblue; display:inline-block;">Welcome to the Sigma Reputation Panel</h1>
  {/if}

    <a class="github-button" href="https://github.com/celaut-project/ergo-reputation-system" target="_blank">
      <img src="https://cdn.icon-icons.com/icons2/844/PNG/512/Github_icon-icons.com_67091.png" alt="GitHub" width="50" height="50">
    </a>
 </div>

 <style>
    .github-button {
      position: fixed;
      top: 20px; /* Ajusta la posición vertical según tu preferencia */
      right: 20px; /* Ajusta la posición horizontal según tu preferencia */
      z-index: 999;
    }
  </style>