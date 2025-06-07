import { 
  DesignAnalysisData, 
  NodeData, 
  ComponentData, 
  InstanceData, 
  DesignTokens,
  InteractiveElement,
  LayoutComplexity,
  ResponsiveBehavior,
  ImageSnapshot,
  PageData
} from './types'

export class DesignExtractor {
  
  async extractDesignData(selection: readonly SceneNode[]): Promise<DesignAnalysisData> {
    if (selection.length === 0) {
      throw new Error('No design elements selected')
    }

    const analysisData: DesignAnalysisData = {
      pages: await this.extractPageData(selection),
      components: await this.extractComponentData(),
      instances: await this.extractInstanceData(selection),
      styles: await this.extractDesignTokens(),
      interactions: await this.extractInteractiveElements(selection),
      layout: await this.analyzeLayoutComplexity(selection),
      responsive: await this.analyzeResponsiveBehavior(selection)
    }

    return analysisData
  }

  private async extractPageData(selection: readonly SceneNode[]): Promise<PageData[]> {
    const pages: PageData[] = []
    const processedPages = new Set<string>()

    for (const node of selection) {
      const page = node.parent
      if (page && page.type === 'PAGE' && !processedPages.has(page.id)) {
        processedPages.add(page.id)
        
        pages.push({
          id: page.id,
          name: page.name,
          type: page.type,
          width: null,
          height: null,
          children: await this.extractNodeHierarchy([node])
        })
      }
    }

    return pages
  }

  private async extractNodeHierarchy(nodes: readonly SceneNode[]): Promise<NodeData[]> {
    const nodeData: NodeData[] = []

    for (const node of nodes) {
      const data: NodeData = {
        id: node.id,
        name: node.name,
        type: node.type,
        visible: node.visible,
        locked: node.locked,
        constraints: {
          horizontal: 'constraints' in node ? String(node.constraints.horizontal) : 'LEFT',
          vertical: 'constraints' in node ? String(node.constraints.vertical) : 'TOP'
        },
        dimensions: this.getNodeDimensions(node)
      }

      // Add auto layout data if available
      if ('layoutMode' in node && node.layoutMode !== 'NONE') {
        data.autoLayout = {
          mode: node.layoutMode,
          spacing: node.itemSpacing,
          padding: {
            top: node.paddingTop,
            right: node.paddingRight,
            bottom: node.paddingBottom,
            left: node.paddingLeft
          },
          counterAxisSizingMode: node.counterAxisSizingMode,
          primaryAxisSizingMode: node.primaryAxisSizingMode
        }
      }

      // Add basic fill data
      if ('fills' in node && node.fills && Array.isArray(node.fills)) {
        data.fills = node.fills.map((fill: any) => ({
          type: fill.type,
          color: fill.type === 'SOLID' ? fill.color : undefined,
          opacity: fill.opacity
        }))
      }

      // Add basic text data for text nodes
      if (node.type === 'TEXT') {
        const textNode = node as TextNode
        data.text = {
          characters: textNode.characters,
          fontName: typeof textNode.fontName === 'object' ? textNode.fontName : { family: 'Inter', style: 'Regular' },
          fontSize: typeof textNode.fontSize === 'number' ? textNode.fontSize : 16,
          fontWeight: 400, // Simplified
          lineHeight: 1.2, // Simplified
          letterSpacing: 0, // Simplified
          fills: []
        }
      }

      // Recursively extract children
      if ('children' in node && node.children.length > 0) {
        data.children = await this.extractNodeHierarchy(node.children)
      }

      nodeData.push(data)
    }

    return nodeData
  }

  private getNodeDimensions(node: SceneNode): { width: number; height: number; x: number; y: number } {
    return {
      width: 'width' in node ? node.width : 0,
      height: 'height' in node ? node.height : 0,
      x: 'x' in node ? node.x : 0,
      y: 'y' in node ? node.y : 0
    }
  }

  private async extractComponentData(): Promise<ComponentData[]> {
    const components: ComponentData[] = []
    
    // Get all local components from the current file
    const localComponents = figma.root.findAll(node => 
      node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
    )

    for (const component of localComponents) {
      if (component.type === 'COMPONENT') {
        const comp = component as ComponentNode
        components.push({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          type: 'COMPONENT',
          variants: [],
          properties: [],
          instances: this.countComponentInstances(comp.id),
          complexity: this.calculateComponentComplexity(comp)
        })
      }
    }

    return components
  }

  private countComponentInstances(componentId: string): number {
    const instances = figma.root.findAll(node => 
      node.type === 'INSTANCE' && (node as InstanceNode).mainComponent?.id === componentId
    )
    return instances.length
  }

  private calculateComponentComplexity(component: ComponentNode): any {
    const childCount = this.getDescendantCount(component)
    const hasInteractions = this.hasInteractiveElements([component])
    const variantCount = component.variantProperties ? Object.keys(component.variantProperties).length : 0

    const structure = Math.min(10, Math.floor(childCount / 5) + 1)
    const interactions = hasInteractions ? 3 : 1
    const variants = Math.min(3, variantCount)
    const overall = Math.min(10, Math.floor((structure + interactions + variants) / 3))

    return {
      structure,
      interactions,
      variants,
      overall
    }
  }

  private getDescendantCount(node: SceneNode): number {
    let count = 1
    if ('children' in node) {
      for (const child of node.children) {
        count += this.getDescendantCount(child)
      }
    }
    return count
  }

  private async extractInstanceData(selection: readonly SceneNode[]): Promise<InstanceData[]> {
    const instances: InstanceData[] = []
    
    const allInstances = this.findAllInstancesInSelection(selection)
    
    for (const instance of allInstances) {
      instances.push({
        id: instance.id,
        componentId: instance.mainComponent?.id || '',
        overrides: {},
        isNested: this.isNestedInstance(instance),
        depth: this.calculateNestingDepth(instance)
      })
    }

    return instances
  }

  private findAllInstancesInSelection(nodes: readonly SceneNode[]): InstanceNode[] {
    const instances: InstanceNode[] = []
    
    for (const node of nodes) {
      if (node.type === 'INSTANCE') {
        instances.push(node as InstanceNode)
      }
      if ('children' in node) {
        instances.push(...this.findAllInstancesInSelection(node.children))
      }
    }
    
    return instances
  }

  private isNestedInstance(instance: InstanceNode): boolean {
    let parent = instance.parent
    while (parent) {
      if (parent.type === 'INSTANCE') {
        return true
      }
      parent = parent.parent
    }
    return false
  }

  private calculateNestingDepth(node: SceneNode): number {
    let depth = 0
    let parent = node.parent
    while (parent && parent.type !== 'PAGE') {
      depth++
      parent = parent.parent
    }
    return depth
  }

  private async extractDesignTokens(): Promise<DesignTokens> {
    return {
      colors: this.extractColorTokens(),
      typography: this.extractTypographyTokens(),
      spacing: [],
      effects: this.extractEffectTokens(),
      usage: {
        systemTokens: 0,
        customValues: 0,
        consistencyScore: 0
      }
    }
  }

  private extractColorTokens(): any[] {
    const colors: any[] = []
    const localPaintStyles = figma.getLocalPaintStyles()
    
    for (const style of localPaintStyles) {
      colors.push({
        name: style.name,
        value: style.paints[0] && style.paints[0].type === 'SOLID' ? (style.paints[0] as any).color : { r: 0, g: 0, b: 0 },
        usage: 0
      })
    }
    
    return colors
  }

  private extractTypographyTokens(): any[] {
    const typography: any[] = []
    const localTextStyles = figma.getLocalTextStyles()
    
    for (const style of localTextStyles) {
      typography.push({
        name: style.name,
        fontFamily: style.fontName.family,
        fontSize: style.fontSize,
        fontWeight: 400, // Default as TextStyle doesn't expose fontWeight
        lineHeight: typeof style.lineHeight === 'object' ? (style.lineHeight as any).value || 1.2 : 1.2,
        usage: 0
      })
    }
    
    return typography
  }

  private extractEffectTokens(): any[] {
    const effects: any[] = []
    const localEffectStyles = figma.getLocalEffectStyles()
    
    for (const style of localEffectStyles) {
      effects.push({
        name: style.name,
        type: style.effects[0]?.type || 'UNKNOWN',
        properties: style.effects[0] || {},
        usage: 0
      })
    }
    
    return effects
  }

  private async extractInteractiveElements(selection: readonly SceneNode[]): Promise<InteractiveElement[]> {
    const interactive: InteractiveElement[] = []
    
    const allNodes = this.getAllNodesInSelection(selection)
    
    for (const node of allNodes) {
      if (this.isInteractiveElement(node)) {
        interactive.push({
          id: node.id,
          type: this.getInteractiveType(node),
          states: ['Default'],
          actions: [],
          accessibility: {
            hasAltText: 'description' in node && !!node.description,
            focusable: true,
            ariaLabel: 'description' in node ? node.description : undefined
          }
        })
      }
    }
    
    return interactive
  }

  private getAllNodesInSelection(nodes: readonly SceneNode[]): SceneNode[] {
    const allNodes: SceneNode[] = []
    
    for (const node of nodes) {
      allNodes.push(node)
      if ('children' in node) {
        allNodes.push(...this.getAllNodesInSelection(node.children))
      }
    }
    
    return allNodes
  }

  private isInteractiveElement(node: SceneNode): boolean {
    // Check for button-like naming patterns
    const buttonPatterns = /button|btn|click|press|submit|link|nav/i
    return buttonPatterns.test(node.name)
  }

  private getInteractiveType(node: SceneNode): 'BUTTON' | 'INPUT' | 'LINK' | 'FORM' | 'NAVIGATION' {
    const name = node.name.toLowerCase()
    
    if (name.includes('button') || name.includes('btn')) return 'BUTTON'
    if (name.includes('input') || name.includes('field')) return 'INPUT'
    if (name.includes('link')) return 'LINK'
    if (name.includes('form')) return 'FORM'
    if (name.includes('nav') || name.includes('menu')) return 'NAVIGATION'
    
    return 'BUTTON' // Default
  }

  private hasInteractiveElements(nodes: readonly SceneNode[]): boolean {
    return this.getAllNodesInSelection(nodes).some(node => this.isInteractiveElement(node))
  }

  private async analyzeLayoutComplexity(selection: readonly SceneNode[]): Promise<LayoutComplexity> {
    const allNodes = this.getAllNodesInSelection(selection)
    
    const nestingDepth = Math.max(...allNodes.map(node => this.calculateNestingDepth(node)))
    const autoLayoutNodes = allNodes.filter(node => 'layoutMode' in node && node.layoutMode !== 'NONE')
    const autoLayoutUsage = autoLayoutNodes.length
    
    const constraintPatterns = ['LEFT-TOP', 'CENTER-CENTER'] // Simplified
    const responsiveElements = allNodes.filter(node => 'constraints' in node).length
    
    // Calculate complexity score (1-10)
    let score = 1
    score += Math.min(3, Math.floor(nestingDepth / 3))
    score += Math.min(2, Math.floor(autoLayoutUsage / 5))
    score += Math.min(2, constraintPatterns.length / 2)
    score += Math.min(2, Math.floor(responsiveElements / 3))
    
    return {
      nestingDepth,
      autoLayoutUsage,
      constraintPatterns,
      responsiveElements,
      score: Math.min(10, score)
    }
  }

  private async analyzeResponsiveBehavior(selection: readonly SceneNode[]): Promise<ResponsiveBehavior> {
    return {
      breakpoints: [],
      adaptiveComponents: [],
      contentReflow: []
    }
  }
}