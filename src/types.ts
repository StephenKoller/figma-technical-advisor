// Core data structures for design analysis

export interface DesignAnalysisData {
  pages: PageData[]
  components: ComponentData[]
  instances: InstanceData[]
  styles: DesignTokens
  interactions: InteractiveElement[]
  layout: LayoutComplexity
  responsive: ResponsiveBehavior
  images?: ImageSnapshot[]
}

export interface PageData {
  id: string
  name: string
  type: string
  width: number | null
  height: number | null
  children: NodeData[]
}

export interface NodeData {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  constraints: LayoutConstraints
  dimensions: {
    width: number
    height: number
    x: number
    y: number
  }
  autoLayout?: AutoLayoutData
  fills?: Fill[]
  strokes?: Stroke[]
  effects?: Effect[]
  children?: NodeData[]
  text?: TextData
  componentProperties?: ComponentProperty[]
}

export interface ComponentData {
  id: string
  name: string
  description: string
  type: 'COMPONENT' | 'COMPONENT_SET'
  variants?: VariantData[]
  properties?: ComponentProperty[]
  instances: number
  complexity: ComplexityScore
}

export interface InstanceData {
  id: string
  componentId: string
  overrides: Record<string, any>
  isNested: boolean
  depth: number
}

export interface DesignTokens {
  colors: ColorToken[]
  typography: TypographyToken[]
  spacing: SpacingToken[]
  effects: EffectToken[]
  usage: TokenUsageStats
}

export interface InteractiveElement {
  id: string
  type: 'BUTTON' | 'INPUT' | 'LINK' | 'FORM' | 'NAVIGATION'
  states: string[]
  actions: string[]
  accessibility: AccessibilityData
}

export interface LayoutComplexity {
  nestingDepth: number
  autoLayoutUsage: number
  constraintPatterns: string[]
  responsiveElements: number
  score: number // 1-10 complexity rating
}

export interface ResponsiveBehavior {
  breakpoints: BreakpointData[]
  adaptiveComponents: string[]
  contentReflow: string[]
}

export interface ImageSnapshot {
  id: string
  description: string
  data: string // base64 encoded image
  context: 'layout' | 'component' | 'responsive' | 'custom'
}

// Claude API Integration Types
export interface ClaudeAnalysisRequest {
  designData: DesignAnalysisData
  analysisType: 'full' | 'component' | 'layout'
  priority: 'feasibility' | 'effort' | 'coordination' | 'all'
}

export interface ClaudeAnalysisResponse {
  feasibility: FeasibilityAnalysis
  effort: EffortEstimate
  coordination: CoordinationRequirements
  recommendations: Recommendation[]
  risks: Risk[]
  confidence: number // 0-1 confidence score
}

export interface FeasibilityAnalysis {
  score: number // 1-10 scale
  technical: string
  challenges: string[]
  alternatives: string[]
}

export interface EffortEstimate {
  hours: number
  storyPoints: number
  complexity: 'low' | 'medium' | 'high'
  breakdown: EffortBreakdown[]
}

export interface CoordinationRequirements {
  teams: string[]
  dependencies: string[]
  timeline: string
  criticalPath: string[]
}

export interface Recommendation {
  type: 'optimization' | 'alternative' | 'phasing' | 'tooling'
  priority: 'high' | 'medium' | 'low'
  description: string
  impact: string
}

export interface Risk {
  category: 'technical' | 'timeline' | 'resource' | 'design'
  severity: 'high' | 'medium' | 'low'
  description: string
  mitigation: string
}

// Supporting types
export interface LayoutConstraints {
  horizontal: string
  vertical: string
}

export interface AutoLayoutData {
  mode: 'HORIZONTAL' | 'VERTICAL' | 'NONE'
  spacing: number
  padding: Padding
  counterAxisSizingMode: string
  primaryAxisSizingMode: string
}

export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Fill {
  type: string
  color?: RGB
  opacity?: number
  imageRef?: string
}

export interface Stroke {
  type: string
  color: RGB
  weight: number
}

export interface Effect {
  type: string
  visible: boolean
  radius?: number
  offset?: { x: number; y: number }
  color?: RGB
}

export interface RGB {
  r: number
  g: number
  b: number
}

export interface TextData {
  characters: string
  fontName: FontName
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  fills: Fill[]
}

export interface FontName {
  family: string
  style: string
}

export interface VariantData {
  name: string
  properties: Record<string, string>
}

export interface ComponentProperty {
  name: string
  type: 'BOOLEAN' | 'TEXT' | 'VARIANT' | 'INSTANCE_SWAP'
  defaultValue: any
  variantOptions?: string[]
}

export interface ColorToken {
  name: string
  value: RGB
  usage: number
}

export interface TypographyToken {
  name: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  usage: number
}

export interface SpacingToken {
  name: string
  value: number
  usage: number
}

export interface EffectToken {
  name: string
  type: string
  properties: Record<string, any>
  usage: number
}

export interface TokenUsageStats {
  systemTokens: number
  customValues: number
  consistencyScore: number
}

export interface AccessibilityData {
  hasAltText: boolean
  contrastRatio?: number
  focusable: boolean
  ariaLabel?: string
}

export interface BreakpointData {
  name: string
  width: number
  adaptations: string[]
}

export interface ComplexityScore {
  structure: number
  interactions: number
  variants: number
  overall: number
}

export interface EffortBreakdown {
  category: string
  hours: number
  description: string
}