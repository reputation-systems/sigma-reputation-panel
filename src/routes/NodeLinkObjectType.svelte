<script lang="ts">
  import { Position, type NodeProps, Handle, useSvelteFlow } from '@xyflow/svelte';;
  import { data_store } from '$lib/store';
  import { type LinkedHash } from '$lib/LinkedObject';
  
  type $$Props = NodeProps;

  export let id: $$Props['id'];
  export let data: $$Props['data']; data;
  export let dragHandle: $$Props['dragHandle'] = undefined; dragHandle;
  export let type: $$Props['type'] = undefined; type;
  export let selected: $$Props['selected'] = undefined; selected;
  export let isConnectable: $$Props['isConnectable'] = undefined; isConnectable;
  export let zIndex: $$Props['zIndex'] = undefined; zIndex;
  export let width: $$Props['width'] = undefined; width;
  export let height: $$Props['height'] = undefined; height;
  export let dragging: $$Props['dragging']; dragging;
  export let targetPosition: $$Props['targetPosition'] = undefined; targetPosition;
  export let sourcePosition: $$Props['sourcePosition'] = undefined; sourcePosition;

  //  const connections = useHandleConnections({ nodeId: id, type: 'target' });

  let showModal = false;
  let hashes: LinkedHash = data.hashes;

  $: isConnectable = true; // $connections.length === 0;

  const { viewport } = useSvelteFlow();

  let showContent = false;
  $: {
    if ($viewport.zoom > 1.8) {
      showContent = true;
    } else {
      showContent = false;
    }
  }

  function handleDblClick() {
    data_store.set(hashes);
  }

</script>

<div>
  <Handle type="target" position={Position.Left} {isConnectable} />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div style="font-size: small;" on:dblclick={handleDblClick}>
      {hashes}
    {#if showContent}
    
    {/if}
  </div>
</div>

<style>
  .customExternalNode {
    border-left: 4px solid #ff4500;
    background: #ffffff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .customNode {
    border-right: 4px solid #0074D9;
    border-left: 4px solid #0074D9;
    background: #ffffff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .customNode:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  .customExternalNode:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  .tag {
    padding: 4px 8px;
    color: black;
    font-size: 8px;
  }

  pre {
    background: #f4f4f4;
    padding: 5px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 8px;
  }

  code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 8px;
  }
</style>
