<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
<script lang="ts">
    import { writable } from 'svelte/store';
    import { SvelteFlow, Background, type Node, Controls, MiniMap, Position, type Edge, ControlButton, type EdgeTypes, type NodeTypes } from '@xyflow/svelte';
    
    import '@xyflow/svelte/dist/style.css';
    import { updateReputationProofList } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';
    import { ObjectType, token_rendered, type ReputationProof } from '$lib/ReputationProof';
    import dagre from '@dagrejs/dagre';

    import Header from './Header.svelte';
    import EdgeType from './EdgeType.svelte';
    import NodeCircleType from './NodeCircleType.svelte';
    import PanelContextMenu from './PanelContextMenu.svelte';
    import { hexToUtf8 } from '$lib/utils';
    import NodeContextMenu from './NodeContextMenu.svelte';
    import NodeProofType from './NodeProofType.svelte';
    import UnconfirmedEdgeType from './UnconfirmedEdgeType.svelte';
    import { advance_mode, connected, fetch_all, proofs, searchStore } from '$lib/store';
    import { onMount } from 'svelte';

    let rightNodeMenu: { id: string; proof?: ReputationProof; top?: number; left?: number; right?: number; bottom?: number } | null;
    let width: number;
    let height: number;
    function handleNodeContextMenu({ detail: { event, node } }) {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      if (node.data.proof) {
        rightNodeMenu = {
          id: node.id,
          proof: node.data.proof ?? null,
          top: event.clientY < height - 200 ? event.clientY : undefined,
          left: event.clientX < width - 200 ? event.clientX : undefined,
          right: event.clientX >= width - 200 ? width - event.clientX : undefined,
          bottom: event.clientY >= height - 200 ? height - event.clientY : undefined
        };        
      }
    }

    // Close the context menu if it's open whenever the window is clicked.
    function handlePaneClick() {
      rightNodeMenu = null;
    }
    
    async function fetchReputationProofs() {
      try {
        if (!(connected)) fetch_all.set(true);
        proofs.set(await updateReputationProofList(explorer_uri, ergo_tree_hash, (typeof ergo !== "undefined")  ? ergo : null, $fetch_all, $searchStore));
        build_graph(Array.from($proofs.values()));
      } catch (error) {
        console.error(error);
      }
    }
    
    onMount(() => fetchReputationProofs())
    connected.subscribe(() => fetchReputationProofs())
    searchStore.subscribe(function () {
      fetchReputationProofs(); 
    });
    fetch_all.subscribe(function () {
      fetchReputationProofs();
    })

    // setInterval(() => {if ($connected) { fetchReputationProofs(); }; console.log("refesh.")}, 1000);


    // GRAPH BUILDER

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 350;
    const nodeHeight = 50;

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
      proof_type: NodeProofType,
      circle_type: NodeCircleType
    };
    const edgeTypes: EdgeTypes = {
      unconfirmed: UnconfirmedEdgeType,
      edge_type: EdgeType
    };

    function onLayout(direction: string) {
      const layoutedElements = getLayoutedElements($nodes, $edges, direction);

      $nodes = layoutedElements.nodes;
      $edges = layoutedElements.edges;
    }

    async function delete_edge(connection: any, submited: string | null) {
      $edges = $edges.filter(edge => edge.id !== connection.edgeId);

      if (submited) {
        $edges.push({
            id: connection.edgeId,
            source: connection.source,
            target: connection.target,
            animated: true,
            data: {
              color: "#ffdf9b",
              tx_id: submited
            },
            type: 'unconfirmed'
          });
          onLayout(window.innerWidth < window.innerHeight ? 'TB' : 'LR', );        
      }
    }

    function build_graph(_proofs: ReputationProof[]) {
      console.log("build graph")
      $nodes = [];
      $edges = [];
      let plain_nodes: any = {};  // Objects of plain nodes and edges.
      let _x = 0; let _y = 0;
      let _edges: Edge[] = [];
      let empty_edges: Edge[] = [];
      _proofs.map(p => {
        $nodes.push({
            id: "proof::"+token_rendered(p),
            sourcePosition: window.innerWidth > window.innerHeight ? Position.Right : Position.Bottom, 
            targetPosition: window.innerWidth > window.innerHeight ? Position.Left : Position.Top,
            data: { label: p.token_id.slice(0, 10), proof: p, delete_edge_function: delete_edge},
            type: "proof_type",
            position: { x: _x, y: _y },
          });

        p.current_boxes.map(b => {
          const percentage_of_tokens = parseFloat(Number(b.token_amount/p.total_amount * 100).toFixed(3));
          if (
              b.object_value && b.object_type &&
              b.object_type == ObjectType.ProofByToken
            ) {
              _edges.push({
                id: 'box-edge::'+b.box_id,
                source: "proof::"+token_rendered(p),
                target: "proof::"+b.object_value,
                animated: true,
                data: {
                  box: b.box_id,
                  negative: b.negative,
                  proportion: percentage_of_tokens,
                  color: b.negative ? "#FF7000" : "#ffcc00"
                },
                type: 'edge_type'
              });
          }
          else if (
            b.object_value && b.object_type &&
            b.object_type == ObjectType.PlainText
          ) {
            let node_id = 'plain-node::'+b.object_value;
            if (! (node_id in plain_nodes)) {
                plain_nodes[node_id] = {
                  node: {
                    id: node_id,
                    data: {label: hexToUtf8(b.object_value), ellipsis: ".."},
                    type: "circle_type",
                    sourcePosition: window.innerWidth > window.innerHeight ? Position.Right : Position.Bottom, 
                    targetPosition: window.innerWidth > window.innerHeight ? Position.Left : Position.Top,
                    position: { x: _x, y: _y },
                  },
                  edges: []
                }
            }
            plain_nodes[node_id].edges.push({
              id: 'box-edge::'+b.box_id,
              source: "proof::"+token_rendered(p),
              target: node_id,
              data: {
                box: b.box_id,
                negative: b.negative,
                proportion: percentage_of_tokens,
                color: b.negative ? "#FF7000" : "#ffcc00"
              },
              type: 'edge_type'
            });
          }
          else {
            empty_edges.push({
                id: 'box-edge::'+b.box_id,
                source: "proof::"+token_rendered(p),
                target: "empty-node",
                data: {
                  box: b.box_id,
                  negative: b.negative,
                  proportion: percentage_of_tokens,
                  color: b.negative ? "#FDE4A1" : "#FDEAA1"
                },
                type: 'edge_type'
              });
          }
        });
      });
      for (const data of Object.values(plain_nodes)) {
        try {
          $nodes.push(data.node);
          for (const edge of Object.values(data.edges)) {
            _edges.push(edge);
          }          
        } catch {}
      }
      $nodes.push({
                id: "empty-node",
                data: {label: ""},
                type: "circle_type",
                sourcePosition: window.innerWidth > window.innerHeight ? Position.Right : Position.Bottom, 
                targetPosition: window.innerWidth > window.innerHeight ? Position.Left : Position.Top,
                position: { x: _x, y: _y },
              }); 
      for (const empty_edge of empty_edges) {
        _edges.push(empty_edge)
      }
      $edges = _edges;
      onLayout(window.innerWidth < window.innerHeight ? 'TB' : 'LR', );
    }
  </script>
  

  <div style="height:100vh;" bind:clientWidth={width} bind:clientHeight={height}>
    <SvelteFlow 
      on:nodecontextmenu={handleNodeContextMenu} 
      on:paneclick={handlePaneClick}
      {nodes} {edges} {nodeTypes} {edgeTypes} 
      style="background: #1a192bbe" fitView
    >
      <Background />
      <Header/>
      <Controls
        showLock={$advance_mode}
        showZoom={$advance_mode}
        showFitView={$advance_mode}
      >
        {#if $advance_mode}
          <ControlButton on:click={() => onLayout('TB')}><i class="fas fa-regular fa-ruler-horizontal"></i></ControlButton>
          <ControlButton on:click={() => onLayout('LR')}><i class="fas fa-regular fa-ruler-vertical"></i></ControlButton>
        {/if}
      </Controls>
      {#if $advance_mode}
        <MiniMap />
      {/if}
    </SvelteFlow>
    
    {#if rightNodeMenu}
      <NodeContextMenu
        onClick={handlePaneClick}
        proof={rightNodeMenu.proof ?? null}
      />
    {:else}
      <PanelContextMenu />
    {/if}
    
  </div>