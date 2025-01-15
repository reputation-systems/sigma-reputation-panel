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

  const baseHashes = {
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': 'SHA2 256',
      'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a': 'SHA3 256',
      '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f': 'SHAKE 256'
  };

  let showModal = false;
  let hashes: LinkedHash[] = data.hashes;

  $: isConnectable = true;

  const { viewport } = useSvelteFlow();

  let showContent = false;
  $: {
    showContent = $viewport.zoom > 1.8;
  }

</script>

<div class="customNode">
  <Handle type="target" position={Position.Left} {isConnectable} />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div style="font-size: smaller;">
    {#each hashes as {algorithm, value}}
      <div>
        <strong>{baseHashes[algorithm] ?? algorithm?.slice(0, 6) ?? 'Unknown'}:</strong> {value.slice(0, 6)}
      </div>
    {/each}
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