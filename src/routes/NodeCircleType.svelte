<script lang="ts">
  import { Position, type NodeProps, Handle, useHandleConnections } from '@xyflow/svelte';
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

  $: isConnectable = $connections.length === 0;
</script>

<div class="customNode">
  <Handle type="target" position={Position.Left} {isConnectable} />
</div>

<style>
  .customNode {
    background: white;
    padding: 12px;
    border-radius: 20px;
    border: 1px solid black;
  }
</style>
