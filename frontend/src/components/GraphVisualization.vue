<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from '../stores/main'
import * as d3 from 'd3'
import type { GraphNode, GraphLink } from '../types'

const store = useStore()
const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

let simulation: d3.Simulation<GraphNode, GraphLink> | null = null

const typeColors: Record<string, string> = {
  function: '#00ff88',
  class: '#0ea5e9',
  interface: '#f472b6',
  variable: '#fbbf24',
  decorator: '#a78bfa'
}

function buildGraphData() {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const nodeMap = new Map<string, GraphNode>()

  store.elements.forEach(el => {
    const node: GraphNode = {
      id: `el-${el.id}`,
      name: el.name,
      type: el.element_type,
      file_path: el.file_path
    }
    nodes.push(node)
    nodeMap.set(el.name, node)
  })

  store.relations.forEach(rel => {
    const source = nodeMap.get(rel.from_name || '')
    const target = nodeMap.get(rel.to_name || '')
    
    if (source && target) {
      links.push({
        source: source.id,
        target: target.id,
        type: rel.relation_type
      })
    }
  })

  return { nodes, links }
}

function initGraph() {
  if (!svgRef.value || !containerRef.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  d3.select(svgRef.value).selectAll('*').remove()

  const svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g')

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  svg.call(zoom)

  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#64748b')

  const { nodes, links } = buildGraphData()

  if (nodes.length === 0) {
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '14px')
      .text('No elements to display')
    return
  }

  simulation = d3.forceSimulation<GraphNode>(nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40))

  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', '#334155')
    .attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#arrowhead)')

  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .call(d3.drag<SVGGElement, GraphNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended) as any)

  node.append('circle')
    .attr('r', 12)
    .attr('fill', d => typeColors[d.type] || '#64748b')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('filter', 'drop-shadow(0 0 8px rgba(0,0,0,0.5))')

  node.append('text')
    .attr('dx', 18)
    .attr('dy', 4)
    .attr('fill', '#e2e8f0')
    .attr('font-size', '12px')
    .attr('font-family', 'JetBrains Mono, monospace')
    .text(d => d.name)

  node.append('title')
    .text(d => `${d.name} (${d.type})\n${d.file_path || ''}`)

  node.on('mouseover', function(event, d) {
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', 16)
      .attr('stroke-width', 3)
  })

  node.on('mouseout', function() {
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', 12)
      .attr('stroke-width', 2)
  })

  simulation.on('tick', () => {
    link
      .attr('x1', d => (d.source as unknown as GraphNode).x!)
      .attr('y1', d => (d.source as unknown as GraphNode).y!)
      .attr('x2', d => (d.target as unknown as GraphNode).x!)
      .attr('y2', d => (d.target as unknown as GraphNode).y!)

    node.attr('transform', d => `translate(${d.x},${d.y})`)
  })

  function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    if (!event.active) simulation?.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
    if (!event.active) simulation?.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
}

watch(() => [store.elements, store.relations], () => {
  initGraph()
}, { deep: true })

onMounted(() => {
  initGraph()
  window.addEventListener('resize', initGraph)
})

onUnmounted(() => {
  simulation?.stop()
  window.removeEventListener('resize', initGraph)
})
</script>

<template>
  <div class="graph-container" ref="containerRef">
    <div class="graph-header">
      <h3>Knowledge Graph</h3>
      <div class="legend">
        <div v-for="(color, type) in typeColors" :key="type" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: color }"></span>
          <span>{{ type }}</span>
        </div>
      </div>
    </div>
    <svg ref="svgRef" class="graph-svg"></svg>
  </div>
</template>

<style scoped>
.graph-container {
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.graph-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  text-transform: capitalize;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.graph-svg {
  flex: 1;
  background: radial-gradient(circle at center, rgba(0, 255, 136, 0.03) 0%, transparent 70%);
}
</style>
