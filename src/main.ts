import { showUI, on, emit } from '@create-figma-plugin/utilities'

// Show the plugin UI when the plugin is launched
export default function () {
  showUI({ height: 400, width: 320 })
  
  // Listen for messages from the UI
  on('ANALYZE_SELECTION', handleAnalyzeSelection)
  on('CLOSE_PLUGIN', handleClosePlugin)
}

async function handleAnalyzeSelection() {
  const selection = figma.currentPage.selection
  
  if (selection.length === 0) {
    emit('NO_SELECTION')
    return
  }

  // Get the first selected node for analysis
  const selectedNode = selection[0]
  
  // Extract basic information about the selected design
  const designData = {
    type: selectedNode.type,
    name: selectedNode.name,
    width: 'width' in selectedNode ? selectedNode.width : null,
    height: 'height' in selectedNode ? selectedNode.height : null,
    children: 'children' in selectedNode ? selectedNode.children.length : 0,
    layers: getLayerCount(selectedNode),
    hasText: hasTextNodes(selectedNode),
    hasImages: hasImageNodes(selectedNode),
    hasComponents: hasComponentNodes(selectedNode),
  }

  // Send the design data to the UI for Claude API processing
  emit('DESIGN_EXTRACTED', designData)
}

function handleClosePlugin() {
  figma.closePlugin()
}

function getLayerCount(node: SceneNode): number {
  let count = 1
  if ('children' in node) {
    for (const child of node.children) {
      count += getLayerCount(child)
    }
  }
  return count
}

function hasTextNodes(node: SceneNode): boolean {
  if (node.type === 'TEXT') {
    return true
  }
  if ('children' in node) {
    return node.children.some(child => hasTextNodes(child))
  }
  return false
}

function hasImageNodes(node: SceneNode): boolean {
  if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
    const fills = 'fills' in node ? node.fills : []
    if (Array.isArray(fills)) {
      return fills.some(fill => fill.type === 'IMAGE')
    }
  }
  if ('children' in node) {
    return node.children.some(child => hasImageNodes(child))
  }
  return false
}

function hasComponentNodes(node: SceneNode): boolean {
  if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    return true
  }
  if ('children' in node) {
    return node.children.some(child => hasComponentNodes(child))
  }
  return false
}