<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import {
      SvelteFlow,
      Controls,
      Background,
      BackgroundVariant,
      MiniMap
    } from '@xyflow/svelte';
   
    // 👇 this is important! You need to import the styles for Svelte Flow to work
    import '@xyflow/svelte/dist/style.css';
    import type { RPBox, ReputationProof } from '$lib/ReputationProof';
    import { updateReputationProofList } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';

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

    let nodes: Node[];
    let edges: Node[];
    let snapGrid: [number, number] = [25, 25];   
   
    function build_graph(unspend_reputation_proofs: RPBox[] ) {
        // We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
        nodes = writable([
        {
            id: '1',
            type: 'input',
            data: { label: 'Input Node' },
            position: { x: 0, y: 0 }
        },
        {
            id: '2',
            type: 'default',
            data: { label: 'Node' },
            position: { x: 0, y: 150 }
        }
        ]);
    
        // same for edges
        edges = writable([
        {
            id: '1-2',
            type: 'default',
            source: '1',
            target: '2',
            label: 'Edge Text'
        }
        ]);
     
    }

  </script>
   
  <!--
  👇 By default, the Svelte Flow container has a height of 100%.
  This means that the parent container needs a height to render the flow.
  -->
  <div style:height="500px">
    <SvelteFlow
      {nodes}
      {edges}
      {snapGrid}
      fitView
      on:nodeclick={(event) => console.log('on node click', event.detail.node)}
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap />
    </SvelteFlow>
  </div>