<script lang="ts">
    import { Position, type NodeProps, Handle, useHandleConnections, useSvelteFlow, type Connection } from '@xyflow/svelte';
    import PointOneToAnother from './PointOneToAnother.svelte';
    import { ObjectType, type RPBox, type ReputationProof } from '$lib/ReputationProof';
    import { hexToUtf8 } from '$lib/utils';
    type $$Props = NodeProps;
  
    export let id: $$Props['id'];
    export let data: $$Props['data']; data;
    export let dragHandle: $$Props['dragHandle'] = undefined; dragHandle;
    export let type: $$Props['type']  = undefined; type;
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
            object_type_to_assign = ObjectType.ProofByToken
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
  
  <div class="customNode">
    <Handle type="target" position={Position.Left} {isConnectable} />
    <Handle
      type="source" 
      position={Position.Right} 
      onconnect={handleConnection}
    />
    <div style="font-size: small;">
        {data.label}
      {#if showContent}
        <br/>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>More info ...</a>
      {/if}
    </div>
  </div>
  
  <style>
    .customNode {
      background: white;
      padding: 12px;
      border-radius: 3px;
      border: 1px solid black;
    }
  </style>
  

  {#if proof && connection && delete_edge_function && object_to_assign && object_type_to_assign}
    <PointOneToAnother bind:delete_edge_function bind:connection bind:showModal bind:proof bind:object_to_assign bind:object_type_to_assign/>
  {/if}