<script lang="ts">
  import { Position, type NodeProps, Handle, useSvelteFlow } from '@xyflow/svelte';
  import { data_store } from '$lib/store';
  import { type LinkedHash } from '$lib/LinkedObject';
  
  type $$Props = NodeProps;

  export let id: $$Props['id'];
  export let data: $$Props['data'];
  export let dragHandle: $$Props['dragHandle'] = undefined;
  export let type: $$Props['type'] = undefined;
  export let selected: $$Props['selected'] = undefined;
  export let isConnectable: $$Props['isConnectable'] = undefined;
  export let zIndex: $$Props['zIndex'] = undefined;
  export let width: $$Props['width'] = undefined;
  export let height: $$Props['height'] = undefined;
  export let dragging: $$Props['dragging'];
  export let targetPosition: $$Props['targetPosition'] = undefined;
  export let sourcePosition: $$Props['sourcePosition'] = undefined;

  let showModal = false;
  let hashes: LinkedHash[] = data.hashes;

  $: isConnectable = true;

  const { viewport } = useSvelteFlow();

  let showContent = false;
  $: {
    showContent = $viewport.zoom > 1.8;
  }

  function handleDblClick() {
    data_store.set(hashes);
  }
</script>

<div class="customNode">
  <Handle type="target" position={Position.Left} {isConnectable} />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div style="font-size: smaller;" on:dblclick={handleDblClick}>
    {#if showContent}
      {#each hashes as { algorithm, value }}
        <div><strong>{algorithm ?? 'Unknown'}:</strong> {value}</div>
      {/each}
    {:else}
      {#if hashes.length > 0}
        {hashes[0].value}
      {:else}
        No data available
      {/if}
    {/if}
  </div>
</div>

<style>
  .customNode {
    background: white;
    padding: 12px;
    border-radius: 20px;
    border: 1px solid black;
    font-size: smaller;
  }

  .customNode:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
</style>