<script lang="ts">
    import { writable } from 'svelte/store';
	import { SvelteFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/svelte';
	import { proofs, compute_deep_level } from '$lib/store';
	import { ObjectType, type ReputationProof, compute } from '$lib/ReputationProof';
	import { stringToRendered } from '$lib/utils';
    import ReputationNode from './graph/ReputationNode.svelte';

    const nodeTypes = { reputation: ReputationNode };
    const nodes = writable<Node[]>([]);
    const edges = writable<Edge[]>([]);

	let objectToCalculate: string = '';
	let objectTypeToCalculate: ObjectType = ObjectType.PlainText;
	let finalScore: number | null = null;
    let isLoading = false;

	function calculateAndBuildGraph() {
        isLoading = true;
        finalScore = null;
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
		const visitedProofs = new Set<string>();
        let layoutY = 0; let layoutX = 0;

		const renderedProofs = new Map<string, ReputationProof>();
		$proofs.forEach((value, key) => { renderedProofs.set(stringToRendered(key), value); });

		function buildGraphRecursive(proof: ReputationProof, deepLevel: number, parentX = 0) {
			const proofId = stringToRendered(proof.token_id);
			if (!proof || deepLevel < 0 || visitedProofs.has(proofId)) return;
			visitedProofs.add(proofId);

			newNodes.push({ id: proofId, type: 'reputation', position: { x: parentX + layoutX, y: layoutY }, data: { label: `Prueba: ${proof.tag || 'Sin Tag'}`, tokenId: proof.token_id } });

            let childCount = 0;
			for (const box of proof.current_boxes) {
				if (box.object_type === ObjectType.ProofByToken && box.object_value) {
					const targetProof = renderedProofs.get(box.object_value);
					if (targetProof) {
                        const proportion = (box.token_amount / proof.total_amount);
						newEdges.push({ id: `e-${proofId}-${box.object_value}`, source: proofId, target: box.object_value, label: `${(proportion * 100).toFixed(1)}% ${box.negative ? '(-)' : '(+)'}`, animated: true, style: `stroke: ${box.negative ? '#f44336' : '#4caf50'}; stroke-width: ${1 + proportion * 8};` });
                        layoutY += 200;
                        buildGraphRecursive(targetProof, deepLevel - 1, parentX + (childCount * 250) - 125);
                        layoutY -= 200;
                        childCount++;
					}
				}
			}
            layoutX += 250;
		}

        newNodes.push({ id: 'target-object', type: 'output', position: { x: 0, y: -150 }, data: { label: `Objeto: ${objectToCalculate.substring(0,20)}...` } });

        for (const proof of $proofs.values()) {
            const score = compute(proof, objectTypeToCalculate, objectToCalculate);
            if (score !== 0) {
                const proofId = stringToRendered(proof.token_id);
                newEdges.push({ id: `e-${proofId}-target`, source: proofId, target: 'target-object', label: `Aporta ${score.toFixed(3)}`, style: `stroke: ${score < 0 ? '#f44336' : '#4caf50'};` });
                buildGraphRecursive(proof, $compute_deep_level);
                layoutY = 0;
            }
        }
        
        $nodes = newNodes;
        $edges = newEdges;

        let totalScore = 0;
        for (const proof of $proofs.values()) { totalScore += compute(proof, objectTypeToCalculate, objectToCalculate); }
		finalScore = totalScore;
        isLoading = false;
	}
</script>

<div class="calculator-container">
	<h2>Calculadora de Reputación Visual</h2>
    <div class="input-form">
		<input class="input" bind:value={objectToCalculate} placeholder="URL, texto, hash...">
		<select class="input" bind:value={objectTypeToCalculate}>
			{#each Object.values(ObjectType) as type}<option {value}>{type}</option>{/each}
		</select>
		<button on:click={calculateAndBuildGraph} disabled={isLoading}>{isLoading ? 'Calculando...' : 'Calcular y Dibujar Grafo'}</button>
	</div>
	{#if finalScore !== null}
		<div class="results"><h3>Puntuación Total: <span class:positive={finalScore > 0} class:negative={finalScore < 0}>{finalScore.toFixed(4)}</span></h3></div>
	{/if}
	<div class="graph-wrapper">
        <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
            <Background /> <Controls /> <MiniMap />
        </SvelteFlow>
	</div>
</div>

<style>
    .calculator-container { padding: 2rem; max-width: 100%; margin: auto; }
    .input-form { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
    .input { padding: 0.75rem; background: #333; border: 1px solid #666; border-radius: 6px; color: #f0f0f0; }
    .results h3 { text-align: center; font-size: 1.5rem; }
    .results span.positive { color: #4caf50; } .results span.negative { color: #f44336; }
    .graph-wrapper { width: 100%; height: 70vh; background: #222; border: 1px solid #444; border-radius: 8px; }
</style>
