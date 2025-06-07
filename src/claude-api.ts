import { ClaudeAnalysisRequest, ClaudeAnalysisResponse, DesignAnalysisData } from './types'

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'

export class ClaudeAPIService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async analyzeDesign(request: ClaudeAnalysisRequest): Promise<ClaudeAnalysisResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(request.designData, request.analysisType, request.priority)
      
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return this.parseClaudeResponse(result.content[0].text)
    } catch (error) {
      console.error('Claude API analysis failed:', error)
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private buildAnalysisPrompt(designData: DesignAnalysisData, analysisType: string, priority: string): any[] {
    const content: any[] = []

    // Add structured data as text
    content.push({
      type: 'text',
      text: `You are a senior software engineer providing technical feasibility analysis for Figma designs. 

DESIGN DATA:
${JSON.stringify(designData, null, 2)}

ANALYSIS TYPE: ${analysisType}
PRIORITY FOCUS: ${priority}

Please analyze this design and provide detailed engineering feedback in the following JSON format:

{
  "feasibility": {
    "score": 8,
    "technical": "Highly feasible with modern web technologies...",
    "challenges": ["Complex nested layout structure", "Custom animation requirements"],
    "alternatives": ["Consider CSS Grid instead of flexbox", "Use existing component library"]
  },
  "effort": {
    "hours": 32,
    "storyPoints": 5,
    "complexity": "medium",
    "breakdown": [
      {"category": "Frontend Development", "hours": 20, "description": "Component implementation"},
      {"category": "Testing", "hours": 8, "description": "Unit and integration tests"},
      {"category": "Code Review", "hours": 4, "description": "Review and refinement"}
    ]
  },
  "coordination": {
    "teams": ["Frontend", "Design System", "QA"],
    "dependencies": ["New design tokens", "Icon library updates"],
    "timeline": "2-3 sprints",
    "criticalPath": ["Design system updates", "Component implementation", "Testing"]
  },
  "recommendations": [
    {
      "type": "optimization",
      "priority": "high",
      "description": "Break complex component into smaller, reusable parts",
      "impact": "Reduces development time by 25% and improves maintainability"
    }
  ],
  "risks": [
    {
      "category": "technical",
      "severity": "medium",
      "description": "Complex animation may impact performance on older devices",
      "mitigation": "Implement progressive enhancement with reduced animations"
    }
  ],
  "confidence": 0.85
}

ANALYSIS GUIDELINES:
1. Consider modern web development practices (React, Vue, Angular)
2. Evaluate design system integration and component reusability
3. Assess accessibility requirements and compliance
4. Factor in responsive design complexity
5. Consider performance implications
6. Evaluate testing requirements
7. Assess cross-browser compatibility needs
8. Consider maintenance and scalability factors

Focus on actionable, specific feedback that helps designers understand implementation reality.`
    })

    // Add selective images if available
    if (designData.images && designData.images.length > 0) {
      designData.images.slice(0, 3).forEach(image => {
        content.push({
          type: 'text',
          text: `\n\nVISUAL CONTEXT - ${image.description}:`
        })
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: image.data
          }
        })
      })
    }

    return content
  }

  private parseClaudeResponse(responseText: string): ClaudeAnalysisResponse {
    try {
      // Extract JSON from response (Claude might include additional text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Claude response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate required fields and provide defaults
      return {
        feasibility: parsed.feasibility || {
          score: 5,
          technical: 'Analysis incomplete',
          challenges: [],
          alternatives: []
        },
        effort: parsed.effort || {
          hours: 0,
          storyPoints: 0,
          complexity: 'medium',
          breakdown: []
        },
        coordination: parsed.coordination || {
          teams: [],
          dependencies: [],
          timeline: 'Unknown',
          criticalPath: []
        },
        recommendations: parsed.recommendations || [],
        risks: parsed.risks || [],
        confidence: parsed.confidence || 0.5
      }
    } catch (error) {
      console.error('Failed to parse Claude response:', error)
      throw new Error('Invalid response format from Claude API')
    }
  }

  // Utility method to validate API key format
  static isValidApiKey(apiKey: string): boolean {
    return apiKey.startsWith('sk-ant-') && apiKey.length > 20
  }

  // Method to estimate token usage for cost calculation
  estimateTokenUsage(designData: DesignAnalysisData): { inputTokens: number, outputTokens: number, estimatedCost: number } {
    const dataSize = JSON.stringify(designData).length
    const inputTokens = Math.ceil(dataSize / 4) + 2000 // Data + prompt overhead
    const outputTokens = 4000 // Max output tokens
    
    // Claude 3.5 Sonnet pricing (approximate)
    const inputCost = inputTokens * 0.000003 // $3 per million input tokens
    const outputCost = outputTokens * 0.000015 // $15 per million output tokens
    const estimatedCost = inputCost + outputCost

    return {
      inputTokens,
      outputTokens,
      estimatedCost
    }
  }
}