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
  
  <div class={proof.can_be_spend ? "customNode" : "customExternalNode"}>
    <Handle type="target" position={Position.Left} {isConnectable} />
    <Handle
      type="source" 
      position={Position.Right} 
      onconnect={handleConnection}
      isConnectable={proof.can_be_spend}
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
    .customExternalNode {
      background: #ffffff; /* Blanco puro para un aspecto limpio */
      padding: 16px; /* Aumento del relleno para una mejor legibilidad */
      border-radius: 8px; /* Bordes más redondeados para un estilo suave */
      border: 2px solid #e0e0e0; /* Borde más sutil y moderno */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra suave para profundidad */
      transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transiciones suaves para interactividad */
    }

    .customNode {
      background: #ffffff; /* Blanco puro para un aspecto limpio */
      padding: 16px; /* Aumento del relleno para una mejor legibilidad */
      border-radius: 8px; /* Bordes más redondeados para un estilo suave */
      border: 2px solid #e0e0e0; /* Borde más sutil y moderno */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra suave para profundidad */
      transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transiciones suaves para interactividad */
    }

    .customNode:hover {
      transform: translateY(-3px); /* Efecto de elevación al pasar el ratón */
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada al pasar el ratón */
    }

    .customExternalNode:hover {
      transform: translateY(-3px); /* Efecto de elevación al pasar el ratón */
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada al pasar el ratón */
    }
  </style>
  

  {#if proof && connection && delete_edge_function && object_to_assign && object_type_to_assign}
    <PointOneToAnother bind:delete_edge_function bind:connection bind:showModal bind:proof bind:object_to_assign bind:object_type_to_assign/>
  {/if}