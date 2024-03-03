<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
<script lang="ts">
    import { writable } from 'svelte/store';
    import { SvelteFlow, Background, type Node, Controls, MiniMap, Position, type Edge, ControlButton, type EdgeTypes, type NodeTypes } from '@xyflow/svelte';
  
    import '@xyflow/svelte/dist/style.css';
    import { updateReputationProofList } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';
    import { ObjectType, token_rendered, type ReputationProof } from '$lib/ReputationProof';
    import dagre from '@dagrejs/dagre';

    import Menu from './Menu.svelte';
    import Header from './Header.svelte';
    import EdgeType from './EdgeType.svelte';
    import NodeCircleType from './NodeCircleType.svelte';
    import ContextMenu from './ContextMenu.svelte';
    import { hexToUtf8 } from '$lib/utils';
        
    
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
        const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo);
        const unspend_reputation_proofs = data;
        build_graph(unspend_reputation_proofs);
      } catch (error) {
        console.error(error);
      }
    }
    
    $: if (connected) { fetchReputationProofs(); }

    // setInterval(() => {if (connected) { fetchReputationProofs(); }; console.log("refesh.")}, 1000);

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 172;
    const nodeHeight = 36;

    function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
      const isHorizontal = direction === 'LR';
      dagreGraph.setGraph({ rankdir: direction });

      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      dagre.layout(dagreGraph);

      nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        node.position = {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2
        };
      });

      return { nodes, edges };
    }

    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);
    const nodeTypes: NodeTypes = {
      circle_type: NodeCircleType
    };
    const edgeTypes: EdgeTypes = {
      edge_type: EdgeType
    };

    function onLayout(direction: string) {
      const layoutedElements = getLayoutedElements($nodes, $edges, direction);

      $nodes = layoutedElements.nodes;
      $edges = layoutedElements.edges;
    }

    function build_graph(proofs: ReputationProof[]) {
      $nodes = [];
      let _x = 0; let _y = 0;
      let _edges: Edge[] = [];
      proofs.map(p => {
        $nodes.push({
            id: token_rendered(p),
            sourcePosition: window.innerWidth > window.innerHeight ? Position.Right : Position.Bottom, 
            targetPosition: window.innerWidth > window.innerHeight ? Position.Left : Position.Top,
            data: { label: p.token_id.slice(0, 10) },
            position: { x: _x, y: _y },
          });

        p.current_boxes.map(b => {
          const percentage_of_tokens = parseFloat(Number(b.token_amount/p.total_amount * 100).toFixed(3));
          if (
              b.object_value && b.object_type &&
              b.object_type == ObjectType.ProofByToken
            ) {
              _edges.push({
                id: 'edge-'+b.box_id,
                source: token_rendered(p),
                target: b.object_value,
                animated: true,
                data: {
                  box: b.box_id,
                  proportion: percentage_of_tokens,
                  color: "#ffcc00"
                },
                type: 'edge_type'
              });
          }
          else if (
            b.object_value && b.object_type &&
            b.object_type == ObjectType.PlainText
          ) {
            $nodes.push({
              id: 'node-'+b.box_id,
              data: {label: hexToUtf8(b.object_value), ellipsis: ".."},
              type: "circle_type",
              sourcePosition: window.innerWidth > window.innerHeight ? Position.Right : Position.Bottom, 
              targetPosition: window.innerWidth > window.innerHeight ? Position.Left : Position.Top,
              position: { x: _x, y: _y },
            });
            _edges.push({
                id: 'edge-'+b.box_id,
                source: token_rendered(p),
                target: 'node-'+b.box_id,
                data: {
                  box: b.box_id,
                  proportion: percentage_of_tokens,
                  color: "#ffcc00"
                },
                type: 'edge_type'
              });
          }
          else {
            $nodes.push({
              id: 'node-'+b.box_id,
              data: {label: ""},
              type: "circle_type",
              sourcePosition: window.innerWidth > window.innerHeight ? Position.Right : Position.Bottom, 
              targetPosition: window.innerWidth > window.innerHeight ? Position.Left : Position.Top,
              position: { x: _x, y: _y },
            });
            _edges.push({
                id: 'edge-'+b.box_id,
                source: token_rendered(p),
                target: 'node-'+b.box_id,
                data: {
                  box: b.box_id,
                  proportion: percentage_of_tokens,
                  color: "#FDEAA1"
                },
                type: 'edge_type'
              });
          }
        });
      });
      $edges = _edges;
      onLayout(window.innerWidth < window.innerHeight ? 'TB' : 'LR', );
    }
  </script>
  

  <div style="height:100vh;">
    <SvelteFlow {nodes} {edges} {nodeTypes} {edgeTypes} style="background: #1A192B" fitView>
      <Background />
      <Header />
      <Controls>
        <ControlButton on:click={() => onLayout('TB')}><i class="fas fa-regular fa-ruler-horizontal"></i></ControlButton>
        <ControlButton on:click={() => onLayout('LR')}><i class="fas fa-regular fa-ruler-vertical"></i></ControlButton>
        <Menu bind:connected/>
      </Controls>
      <MiniMap />
    </SvelteFlow>
    <ContextMenu />
  </div>