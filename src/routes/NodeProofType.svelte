<script lang="ts">
  import { Position, type NodeProps, Handle, useHandleConnections, useSvelteFlow, type Connection } from '@xyflow/svelte';
  import PointOneToAnother from './PointOneToAnother.svelte';
  import { ObjectType, type RPBox, type ReputationProof } from '$lib/ReputationProof';
  import { hexToUtf8 } from '$lib/utils';
  import { data_store } from '$lib/store';
  import PointOneToAnObject from './PointOneToAnObject.svelte';

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

  const connections = useHandleConnections({ nodeId: id, type: 'target' });

  let showModal = false;
  let proof: ReputationProof = data.proof;
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
    data_store.set(proof);
  }

  function handleConnection(connections: any[]) {  // <-- type HandleConnection[]
    connection = connections[0];
    if (connection) {
      showModal = true;

      let __target_node_id = connection.target.split("::");
      object_to_assign = hexToUtf8(__target_node_id[1]);
      switch (__target_node_id[0]) {
        case "proof": {
          object_type_to_assign = ObjectType.ProofByToken
          break;
        }
        case "plain-node": {
          object_type_to_assign = ObjectType.PlainText
          break;
        }
        case "object-node": {
          object_type_to_assign = ObjectType.LinkedObject
          break;
        }
        default: {
          object_type_to_assign = null;
          break;
        }
      }
    }
  }

</script>

<div class={proof.can_be_spend ? "customNode" : "customExternalNode"}>
  <Handle type="target" position={Position.Left} {isConnectable} />
  <Handle
    type="source"
    position={Position.Right} 
    onconnect={handleConnection}
    isConnectable={proof.can_be_spend}
  />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div style="font-size: small;" on:dblclick={handleDblClick}>
      {data.label}
    {#if showContent}
      <br/>
      {#if proof && proof.tag}
        {#each proof.tag.split(';') as tag}
          <span class="tag">
            { tag.toLowerCase().replace(/\s+/g, '-') }
          </span>
        {/each}
        <br/>
      {/if}
    {/if}
  </div>
</div>

{#if proof && connection && delete_edge_function && object_to_assign && object_type_to_assign}
  {#if object_type_to_assign === ObjectType.ProofByToken}
    <PointOneToAnother bind:delete_edge_function bind:connection bind:showModal bind:proof bind:object_to_assign bind:object_type_to_assign/>
  {:else if object_type_to_assign === ObjectType.PlainText}
    <PointOneToAnother bind:delete_edge_function bind:connection bind:showModal bind:proof bind:object_to_assign bind:object_type_to_assign/>
  {:else if object_type_to_assign === ObjectType.LinkedObject}
    <PointOneToAnObject bind:delete_edge_function bind:connection bind:showModal bind:proof bind:object_to_assign bind:object_type_to_assign/>
  {/if}
{/if}

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
