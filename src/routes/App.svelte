<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
<script lang="ts">
    import { writable } from 'svelte/store';
    import { SvelteFlow, Background, type Node, Controls, MiniMap, Position } from '@xyflow/svelte';
  
    import '@xyflow/svelte/dist/style.css';
    import { updateReputationProofList } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';
    import type { RPBox, ReputationProof } from '$lib/ReputationProof';

    import Menu from './Menu.svelte';
    import Header from './Header.svelte';
    let connected = false;

    async function connectNautilus() {
        if (typeof ergoConnector !== 'undefined') {
        const nautilus = ergoConnector.nautilus;
        if (nautilus) {
            bind: connected = await nautilus.connect();
            if (connected) {
                console.log('Connected!');
            } else {
                alert('Not connected!');
            }
        } else {
            alert('Nautilus Wallet is not active');
        }
        } else {
        alert('No wallet available');
        }
    }

    if (!connected) { connectNautilus() }
    
    async function fetchReputationProofs() {
      try {
        console.log('Searching for boxes....')
        const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo);
        const unspend_reputation_proofs = data;
        console.log(unspend_reputation_proofs);
        build_graph(unspend_reputation_proofs);
      } catch (error) {
        console.error(error);
      }
    }
    
    $: if (connected) { fetchReputationProofs(); }
  
    const nodes = writable<Node[]>([]);
    const edges = writable([]);

    function build_graph(proofs: ReputationProof[]) {
      $nodes = [];
      $edges = [];
      let _x = 100;
      proofs.map(p => {
        let _y = 100;
        p.current_boxes.map(b => {
          $nodes.push({
            id: b.box_id,
            sourcePosition: window.innerWidth > window.innerHeight ? Position.Right : Position.Bottom, 
            targetPosition: window.innerWidth > window.innerHeight ? Position.Left : Position.Top,
            data: { label: b.box_id.slice(0, 10)+" - "+b.token_id.slice(0, 4) }, 
            position: { x: _x, y: _y },
          });
          _y += 80;
        });
        _x += 180;
      });
    }
  </script>
  

  <div style="height:100vh;">
    <SvelteFlow {nodes} {edges} style="background: rgb(17, 17, 17)" fitView>
      <Background />
      <Header />
      <Controls>
        <Menu bind:connected/>
      </Controls>
      <MiniMap />
    </SvelteFlow>
  </div>