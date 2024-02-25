<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { updateReputationProofList } from '$lib/unspent_proofs';
    import { ergo_tree_hash, explorer_uri } from '$lib/envs';
    import type { ReputationProof } from '$lib/ReputationProof';
  
    let svgElement: SVGSVGElement;
    let unspend_reputation_proofs: ReputationProof[] = [];

    async function fetchReputationProofs() {
		try {
			console.log('Searching for boxes....')
			const data = await updateReputationProofList(explorer_uri, ergo_tree_hash, ergo);
			unspend_reputation_proofs = data;
            console.log(unspend_reputation_proofs)
            build_graph();
		} catch (error) {
			console.error(error);
		}
    }

    function build_graph() {
        const svg = d3.select(svgElement);
        const width = 400, height = 300;
  
        const nodes = unspend_reputation_proofs.map(proof => ({
            id: proof.box_id,
            name: proof.box_id.slice(0, 10) + " - " +proof.token_id.slice(0, 10) + "  ("+proof.token_amount+")"
        }));
    
        /*const links = [
            { source: 1, target: 2 },
            { source: 2, target: 3 },
            { source: 3, target: 1 },
        ];*/  const links = []
    
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));
    
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", 2);
    
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 10)
            .attr("fill", "blue");
    
        const labels = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .text(d => d.name)
            .attr("x", 15)
            .attr("y", 4);
    
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
    
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
    
            labels
                .attr("x", d => d.x + 15)
                .attr("y", d => d.y + 4);
        });
    }
  
    onMount(() => {
        fetchReputationProofs();
    });
  </script>
  
  <svg bind:this={svgElement} width="100%" height="100%"></svg>
  