<script lang="ts">
  import { Position, type NodeProps, Handle, useHandleConnections, useSvelteFlow, type Connection } from '@xyflow/svelte';
  import PointOneToAnother from './PointOneToAnother.svelte';
  import { ObjectType } from '$lib/ReputationProof';
  import { data_store } from '$lib/store';
    import { LinkedHash } from '$lib/LinkedObject';
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
  let connection: any | null;
  let object_to_assign: string | null = null;
  let object_type_to_assign: ObjectType | null = null;
  let delete_edge_function = data.delete_edge_function;

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
      {data.hashes}
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

{#if proof && connection && delete_edge_function && object_to_assign && object_type_to_assign}
  <PointOneToAnother bind:delete_edge_function bind:connection bind:showModal bind:proof bind:object_to_assign bind:object_type_to_assign/>
{/if}