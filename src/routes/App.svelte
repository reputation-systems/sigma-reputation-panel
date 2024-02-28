<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
<script lang="ts">
    import { writable } from 'svelte/store';
    import { SvelteFlow, Background, type Edge, type Node, Controls, MiniMap, ControlButton } from '@xyflow/svelte';
  
    import '@xyflow/svelte/dist/style.css';
    import { updateReputationProofList } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';
    import type { ReputationProof } from '$lib/ReputationProof';

    import Menu from './Menu.svelte';
    import Header from './Header.svelte';
    let connected = false;
    
    async function fetchReputationProofs() {
      try {
        console.log('Searching for boxes....')
        const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo);
        const unspend_reputation_proofs = data.map((e: ReputationProof) => e.current_boxes[0]);;
              console.log(unspend_reputation_proofs)
              build_graph(unspend_reputation_proofs);
      } catch (error) {
        console.error(error);
      }
    }
  
    const initialNodes: Node[] = [
      { id: '1', data: { label: '-' }, position: { x: 100, y: 100 } },
      { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 200 } }
    ];
  
    const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];
  
    const nodes = writable<Node[]>(initialNodes);
    const edges = writable(initialEdges);
  
    let nodeName = 'Node 1';
    let nodeBg = '#eee';
    let nodeHidden = false;
  
    $: updateNode({ nodeName, nodeBg, nodeHidden });
  
    function updateNode({
      nodeName,
      nodeBg,
      nodeHidden
    }: {
      nodeName?: string;
      nodeBg?: string;
      nodeHidden?: boolean;
    }) {
      $nodes.forEach((node) => {
        if (node.id === '1') {
          if (nodeName) {
            // IMPORTANT: You need to mutate the data object
            // otherwise the node will not be updated
            node.data = {
              ...node.data,
              label: nodeName
            };
          }
  
          if (nodeBg) {
            node.style = `background: ${nodeBg}`;
          }
  
          if (nodeHidden !== undefined) {
            node.hidden = nodeHidden;
  
            $edges.forEach((edge) => {
              if (edge.id === 'e1-2') {
                edge.hidden = nodeHidden;
              }
            });
          }
  
          $nodes = $nodes;
          $edges = $edges;
        }
      });
    }
  </script>
  
  
  <div style="height:100vh;">
    <SvelteFlow {nodes} {edges} style="background: rgb(17, 17, 17)" fitView>
      <Background />
       <Header />
      <Controls>
        <Menu connected={connected}/>
      </Controls>
      <MiniMap />
    </SvelteFlow>
  </div>