<script lang="ts">
  
    export let onClick: () => void;
    export let id: string;
    export let top: number | undefined;
    export let left: number | undefined;
    export let right: number | undefined;
    export let bottom: number | undefined;
  
  </script>

<div
style="top: {top}px; left: {left}px; right: {right}px; bottom: {bottom}px;"
class="context-menu"
on:click={onClick}
>
  <div class="navbar" id="navbar">
    <p style="margin: 0.5em;">
      <a>Reputation Proof</a>
      <br/>
      <a>from Ergo Platform</a>
      <br/><br/>
      <a target="_blank" href="https://testnet.ergoplatform.com/en/transactions/"{id}>{id}</a>
      <br/><br/>
    </p>    
</div>
</div>
  
  <style>
    .context-menu {
      position: absolute;
      z-index: 10;
    }

    .navbar{
        display: inline-flex;
        border: 1px #999 solid;
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        flex-direction: column;
    }
    .navbar ul{
        margin: 6px;
    }
  </style>