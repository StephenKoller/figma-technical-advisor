import { render, Container, VerticalSpace, Text, Button, LoadingIndicator } from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'

interface DesignData {
  type: string
  name: string
  width: number | null
  height: number | null
  children: number
  layers: number
  hasText: boolean
  hasImages: boolean
  hasComponents: boolean
}

interface EngineeringFeedback {
  feasibility: string
  effort: string
  coordination: string
  recommendations: string[]
}

function Plugin() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [feedback, setFeedback] = useState<EngineeringFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for messages from the main thread
    on('NO_SELECTION', () => {
      setError('Please select a design element to analyze')
      setIsAnalyzing(false)
    })

    on('DESIGN_EXTRACTED', async (designData: DesignData) => {
      try {
        const engineeringFeedback = await analyzeWithClaude(designData)
        setFeedback(engineeringFeedback)
        setError(null)
      } catch (err) {
        setError('Failed to analyze design. Please try again.')
        console.error('Analysis error:', err)
      } finally {
        setIsAnalyzing(false)
      }
    })
  }, [])

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setError(null)
    setFeedback(null)
    emit('ANALYZE_SELECTION')
  }

  const handleClose = () => {
    emit('CLOSE_PLUGIN')
  }

  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      
      <Text>
        <strong>Technical Advisor</strong>
      </Text>
      
      <VerticalSpace space="small" />
      
      <Text>
        Get engineering feedback on your design's feasibility, implementation effort, and coordination requirements.
      </Text>
      
      <VerticalSpace space="medium" />
      
      <Button 
        fullWidth 
        onClick={handleAnalyze} 
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Selection'}
      </Button>
      
      {isAnalyzing && (
        <>
          <VerticalSpace space="medium" />
          <LoadingIndicator />
        </>
      )}
      
      {error && (
        <>
          <VerticalSpace space="medium" />
          <Text style={{ color: '#f24822' }}>
            {error}
          </Text>
        </>
      )}
      
      {feedback && (
        <>
          <VerticalSpace space="medium" />
          
          <Text><strong>Feasibility</strong></Text>
          <VerticalSpace space="extraSmall" />
          <Text>{feedback.feasibility}</Text>
          
          <VerticalSpace space="small" />
          
          <Text><strong>Implementation Effort</strong></Text>
          <VerticalSpace space="extraSmall" />
          <Text>{feedback.effort}</Text>
          
          <VerticalSpace space="small" />
          
          <Text><strong>Cross-team Coordination</strong></Text>
          <VerticalSpace space="extraSmall" />
          <Text>{feedback.coordination}</Text>
          
          {feedback.recommendations.length > 0 && (
            <>
              <VerticalSpace space="small" />
              <Text><strong>Recommendations</strong></Text>
              <VerticalSpace space="extraSmall" />
              {feedback.recommendations.map((rec, index) => (
                <Text key={index}>
                  • {rec}
                </Text>
              ))}
            </>
          )}
        </>
      )}
      
      <VerticalSpace space="medium" />
      
      <Button fullWidth secondary onClick={handleClose}>
        Close
      </Button>
    </Container>
  )
}

async function analyzeWithClaude(designData: DesignData): Promise<EngineeringFeedback> {
  // TODO: Replace with actual Claude API integration
  // For now, return mock data based on design complexity
  
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
  
  const complexity = calculateComplexity(designData)
  
  return {
    feasibility: getFeasibilityAssessment(complexity, designData),
    effort: getEffortEstimate(complexity, designData),
    coordination: getCoordinationRequirements(designData),
    recommendations: getRecommendations(designData)
  }
}

function calculateComplexity(data: DesignData): 'low' | 'medium' | 'high' {
  let score = 0
  
  if (data.layers > 20) score += 2
  else if (data.layers > 10) score += 1
  
  if (data.children > 10) score += 1
  if (data.hasComponents) score += 1
  if (data.hasImages) score += 1
  if (data.hasText) score += 0.5
  
  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

function getFeasibilityAssessment(complexity: string, data: DesignData): string {
  const complexityMap = {
    low: "Highly feasible with standard web technologies. No significant technical barriers.",
    medium: "Feasible with some complexity. May require custom components or advanced CSS.",
    high: "Complex implementation requiring careful planning. Consider breaking into phases."
  }
  return complexityMap[complexity as keyof typeof complexityMap]
}

function getEffortEstimate(complexity: string, data: DesignData): string {
  const effortMap = {
    low: "1-3 days for a front-end developer. Straightforward implementation.",
    medium: "3-7 days including testing. Moderate complexity with some custom work.",
    high: "1-2 weeks. Significant development effort with potential for iteration."
  }
  return effortMap[complexity as keyof typeof effortMap]
}

function getCoordinationRequirements(data: DesignData): string {
  if (data.hasImages && data.hasComponents) {
    return "Requires coordination with design system team and asset management."
  }
  if (data.hasComponents) {
    return "Coordinate with design system team for component specifications."
  }
  if (data.hasImages) {
    return "Coordinate with design team for final assets and optimization."
  }
  return "Minimal coordination required. Standard implementation."
}

function getRecommendations(data: DesignData): string[] {
  const recommendations: string[] = []
  
  if (data.layers > 15) {
    recommendations.push("Consider simplifying the layer structure for better performance")
  }
  
  if (data.hasComponents) {
    recommendations.push("Ensure components align with existing design system")
  }
  
  if (data.hasImages) {
    recommendations.push("Optimize images for web delivery and consider responsive variants")
  }
  
  if (data.type === 'FRAME' && data.children > 8) {
    recommendations.push("Break complex layouts into smaller, reusable components")
  }
  
  return recommendations
}

export default render(Plugin)