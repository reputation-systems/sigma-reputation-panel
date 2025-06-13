<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
<script lang="ts">
  import { derived, get, writable } from 'svelte/store';
  import { SvelteFlow, Background, type Node, Controls, MiniMap, Position, type Edge, ControlButton, type EdgeTypes, type NodeTypes } from '@xyflow/svelte';
  
  import '@xyflow/svelte/dist/style.css';
  import { updateReputationProofList } from '$lib/unspent_proofs';
  import { type ReputationProof } from '$lib/ReputationProof';
  import dagre from '@dagrejs/dagre';

  import { advance_mode, building_graph, connected, fetch_all, proof_by_token_type_nft_id, proofs, searchStore } from '$lib/store';
  import { onMount } from 'svelte';

  // UI Components
  import EdgeType from './edges/EdgeType.svelte';
  import NodeCircleType from './nodes/NodeCircleType.svelte';
  import EdgeContextMenu from './ui/EdgeContextMenu.svelte';
  import NodeContextMenu from './ui/NodeContextMenu.svelte';
  import NodeProofType from './nodes/NodeProofType.svelte';
  import UnconfirmedEdgeType from './edges/UnconfirmedEdgeType.svelte';
  import EdgeTypeBoth from './edges/EdgeTypeBoth.svelte';
  import PanelContextMenu from './ui/PanelContextMenu.svelte';

  // --- Component State ---
  let rightNodeForProofMenu: { id: string; proof?: ReputationProof; top?: number; left?: number; right?: number; bottom?: number } | null;
  let rightEdgeMenu: { id: string; box_id?: string; top?: number; left?: number; right?: number; bottom?: number } | null;
  let width: number;
  let height: number;
  
  // --- Context Menu Handlers ---
  function handleNodeContextMenu({ detail: { event, node } }) {
    event.preventDefault();
    if (node.data.proof) {
      rightNodeForProofMenu = {
        id: node.id,
        proof: node.data.proof,
        top: event.clientY < height - 200 ? event.clientY : undefined,
        left: event.clientX < width - 200 ? event.clientX : undefined,
        right: event.clientX >= width - 200 ? width - event.clientX : undefined,
        bottom: event.clientY >= height - 200 ? height - event.clientY : undefined
      };
    }
  }

  function handleEdgeContextMenu({ detail: { event, edge } }) {
    event.preventDefault();
    if (edge.data.box_id) {
      rightEdgeMenu = {
        id: edge.id,
        box_id: edge.data.box_id,
        top: event.clientY < height - 200 ? event.clientY : undefined,
        left: event.clientX < width - 200 ? event.clientX : undefined,
        right: event.clientX >= width - 200 ? width - event.clientX : undefined,
        bottom: event.clientY >= height - 200 ? height - event.clientY : undefined
      };
    }
  }

  function handlePaneClick() {
    rightNodeForProofMenu = null;
    rightEdgeMenu = null;
  }
  
  // --- Data Fetching Logic ---
  let isFetching = false;
  async function fetchReputationProofs() {
    if (isFetching) return;
    isFetching = true;
    console.log("Fetching data...");
    try {
      if (!get(connected)) fetch_all.set(true);
      proofs.set(await updateReputationProofList((typeof ergo !== "undefined") ? ergo : null, get(fetch_all), get(searchStore)));
      build_graph(Array.from(get(proofs).values()));
    } catch (error) {
      console.error("Failed to fetch proofs:", error);
    } finally {
      isFetching = false;
    }
  }
  
  const combinedStore = derived([connected, searchStore, fetch_all], ([$connected, $searchStore, $fetch_all]) => ({ $connected, $searchStore, $fetch_all }));

  onMount(() => { fetchReputationProofs(); });
  combinedStore.subscribe(() => { fetchReputationProofs(); });

  // --- Graph Layout Logic ---
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 350;
  const nodeHeight = 50;

  function getLayoutedElements(nodesToLayout: Node[], edgesToLayout: Edge[], direction = 'TB') {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodesToLayout.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
    edgesToLayout.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    dagre.layout(dagreGraph);

    nodesToLayout.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
      node.position = { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 };
    });

    return { nodes: nodesToLayout, edges: edgesToLayout };
  }

  function onLayout(direction: string) {
    const layouted = getLayoutedElements(get(nodes), get(edges), direction);
    nodes.set(layouted.nodes);
    edges.set(layouted.edges);
  }

  // --- Graph Builder (Refactored Logic) ---
  const nodes = writable<Node[]>([]);
  const edges = writable<Edge[]>([]);
  const nodeTypes: NodeTypes = { proof_type: NodeProofType, object_type: NodeCircleType };
  const edgeTypes: EdgeTypes = { unconfirmed: UnconfirmedEdgeType, edge_type: EdgeType, edge_type_both: EdgeTypeBoth };
  
  function build_graph(_proofs: ReputationProof[]) {
    if (get(building_graph)) { return; }
    building_graph.set(true);
    console.log("Building graph...");

    const newNodes: Map<string, Node> = new Map();
    const newEdges: Edge[] = [];
    const emptyEdges: Edge[] = [];

    // First pass: Create nodes for all proofs
    _proofs.forEach(p => {
      newNodes.set(`proof::${p.token_id}`, {
        id: `proof::${p.token_id}`,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: { label: p.type.typeName, proof: p },
        type: "proof_type",
        position: { x: 0, y: 0 }, // Position will be set by layout
      });
    });

    // Second pass: Create edges and object nodes based on the new architecture
    _proofs.forEach(p => {
      const sourceId = `proof::${p.token_id}`;
      
      p.current_boxes.forEach(b => {
        const edgeData = {
          box_id: b.box_id,
          polarization: b.polarization,
          proportion: parseFloat(Number(b.token_amount / p.total_amount * 100).toFixed(3)),
          color: !b.polarization ? "#FF7000" : "#ffcc00"
        };

        if (b.object_pointer) {
          let targetId: string;
          // This checks if the proof is a recursive "Proof-by-Token" type.
          if (b.type.tokenId === get(proof_by_token_type_nft_id)) {
            targetId = `proof::${b.object_pointer}`;
          } else {
            // For all other proof types, the pointer refers to a generic object.
            targetId = `object::${b.object_pointer}`;
            if (!newNodes.has(targetId)) {
              newNodes.set(targetId, {
                id: targetId,
                data: { label: b.object_pointer },
                type: "object_type",
                sourcePosition: Position.Bottom,
                targetPosition: Position.Top,
                position: { x: 0, y: 0 },
              });
            }
          }
          newEdges.push({ id: `box-edge::${b.box_id}`, source: sourceId, target: targetId, data: edgeData, type: 'edge_type' });
        } else {
          // Handle boxes with no object pointer
          emptyEdges.push({ id: `box-edge::${b.box_id}`, source: sourceId, target: "empty-node", data: edgeData, type: 'edge_type' });
        }
      });
    });

    if (emptyEdges.length > 0) {
      newNodes.set("empty-node", { id: "empty-node", data: { label: "Unassigned" }, type: "object_type", position: { x: 0, y: 0 } });
      newEdges.push(...emptyEdges);
    }
    
    // Logic to handle bidirectional edges remains useful
    const finalEdges: Edge[] = [];
    const edgeMap = new Map<string, Edge>();
    newEdges.forEach(edge => {
      const key = `${edge.source}-${edge.target}`;
      const reverseKey = `${edge.target}-${edge.source}`;

      if (edgeMap.has(reverseKey)) {
        const existingEdge = edgeMap.get(reverseKey)!;
        finalEdges.push({
          id: `both-${existingEdge.id}-${edge.id}`,
          source: existingEdge.source,
          target: existingEdge.target,
          data: { source: existingEdge.data, target: edge.data },
          type: 'edge_type_both'
        });
        edgeMap.delete(reverseKey); // Remove to prevent it from being added again
      } else {
        edgeMap.set(key, edge);
      }
    });
    edgeMap.forEach(edge => finalEdges.push(edge)); // Add remaining single edges

    const layouted = getLayoutedElements(Array.from(newNodes.values()), finalEdges, window.innerWidth < window.innerHeight ? 'TB' : 'LR');
    nodes.set(layouted.nodes);
    edges.set(layouted.edges);
    
    building_graph.set(false);
    console.log("Graph build finished.");
  }
</script>

<div style="height:100vh;" bind:clientWidth={width} bind:clientHeight={height}>
  <SvelteFlow 
    on:nodecontextmenu={handleNodeContextMenu} 
    on:edgecontextmenu={handleEdgeContextMenu}
    on:paneclick={handlePaneClick}
    nodes={nodes} 
    edges={edges} 
    {nodeTypes} 
    {edgeTypes} 
    style="background: #1a192bbe" 
    fitView
  >
    <Background />
    <Controls
      showLock={$advance_mode}
      showZoom={$advance_mode}
      showFitView={$advance_mode}
    >
      {#if $advance_mode}
        <ControlButton on:click={() => onLayout('TB')} title="Vertical Layout"><i class="fas fa-regular fa-ruler-horizontal"></i></ControlButton>
        <ControlButton on:click={() => onLayout('LR')} title="Horizontal Layout"><i class="fas fa-regular fa-ruler-vertical"></i></ControlButton>
      {/if}
    </Controls>
    {#if $advance_mode}
      <MiniMap />
    {/if}
  </SvelteFlow>
  
  {#if rightNodeForProofMenu}
    <NodeContextMenu
      onClick={handlePaneClick}
      proof={rightNodeForProofMenu.proof}
      top={rightNodeForProofMenu.top}
      left={rightNodeForProofMenu.left}
      right={rightNodeForProofMenu.right}
      bottom={rightNodeForProofMenu.bottom}
    />
  {/if}
  {#if rightEdgeMenu}
    <EdgeContextMenu
      onClick={handlePaneClick}
      box_id={rightEdgeMenu.box_id}
      top={rightEdgeMenu.top}
      left={rightEdgeMenu.left}
      right={rightEdgeMenu.right}
      bottom={rightEdgeMenu.bottom}
    />
  {/if}
  <PanelContextMenu />
</div>