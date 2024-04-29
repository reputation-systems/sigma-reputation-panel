<script lang="ts">
    import type { ReputationProof } from "$lib/ReputationProof";

  
    export let onClick: () => void;
    export let proof: ReputationProof|null;
    export let top: number | undefined;
    export let left: number | undefined;
    export let right: number | undefined;
    export let bottom: number | undefined;
  

    let local_id: string = proof ? proof.token_id.slice(0, 10) : ""; 
  </script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
style="top: {top}px; left: {left}px; right: {right}px; bottom: {bottom}px;"
class="context-menu"
on:click={onClick}
>
  <div class="navbar" id="navbar">
    <!-- svelte-ignore a11y-missing-attribute -->
    <p style="margin: 0.5em;">
      <!-- svelte-ignore a11y-missing-attribute -->
      Proof <a>{local_id}</a>
      <!-- svelte-ignore a11y-missing-attribute -->
      <br>
      Network <a>Ergo Platform</a>
      <br/><br/>
      {#if proof && proof.tag}
        {#each proof.tag.split(';') as tag}
          <span style={ (proof && proof.can_be_spend) ? "background-color: #007bff" : "background-color: #ff4500" } 
            class="tag tag-hover">
            { tag }
          </span>
        {/each}
      {/if}
    </p>    
</div>
</div>
  
<style>
.context-menu {
    position: absolute;
    z-index: 10;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #007bff; /* Borde azul */
    animation: fadeIn 0.3s;
    background-color: white; /* Fondo blanco para mayor contraste */
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.navbar {
    display: flex;
    background-color: #ffffff; /* Fondo blanco */
    border-radius: 10px;
    overflow: hidden;
    flex-direction: column;
    padding: 1em;
    align-items: center;
    justify-content: center;
    width: auto;
    max-width: 300px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Sombra suave */
}

.navbar a {
    color: #000000; /* Letra negra */
    text-decoration: none;
    margin-bottom: 0.5em;
    font-size: 1.1em; /* Tamaño de letra más grande */
    font-weight: bold; /* Letra en negrita */
}

.tag {
    display: inline-block;
    padding: 6px 12px;
    margin: 4px;
    color: white;
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    font-size: 0.85em;
}

.tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
}


</style>