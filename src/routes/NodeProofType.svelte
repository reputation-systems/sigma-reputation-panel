<script lang="ts">
    import { Position, type NodeProps, Handle, useHandleConnections, useSvelteFlow, type Connection } from '@xyflow/svelte';
    import PointOneToAnother from './PointOneToAnother.svelte';
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

    function handleConnection(connections: Connection[]) {
      let connection = connections[0];
      console.log(connections)
      showModal = true;
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
  

  <PointOneToAnother bind:showModal />