import { render, Container, VerticalSpace, Text, Button, LoadingIndicator, Textbox } from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { ClaudeAPIService } from './claude-api'
import { DesignAnalysisData, ClaudeAnalysisResponse } from './types'

function Plugin() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [feedback, setFeedback] = useState<ClaudeAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  useEffect(() => {
    // Request saved API key from main thread
    emit('GET_API_KEY')

    // Listen for messages from the main thread
    on('API_KEY_RETRIEVED', (savedApiKey: string | null) => {
      if (savedApiKey && ClaudeAPIService.isValidApiKey(savedApiKey)) {
        setApiKey(savedApiKey)
        setShowApiKeyInput(false)
      } else {
        setShowApiKeyInput(true)
      }
    })

    on('API_KEY_SAVED', (success: boolean) => {
      if (success) {
        setShowApiKeyInput(false)
        setError(null)
        console.log('API Key saved successfully')
      } else {
        setError('Failed to save API key. Please try again.')
        console.log('API Key save failed')
      }
    })

    on('NO_SELECTION', () => {
      setError('Please select a design element to analyze')
      setIsAnalyzing(false)
      setIsExtracting(false)
    })

    on('EXTRACTION_STARTED', () => {
      setIsExtracting(true)
      setError(null)
    })

    on('EXTRACTION_ERROR', (errorMessage: string) => {
      setError(`Extraction failed: ${errorMessage}`)
      setIsExtracting(false)
      setIsAnalyzing(false)
    })

    on('DESIGN_EXTRACTED', async (designData: DesignAnalysisData) => {
      setIsExtracting(false)
      
      if (!apiKey || !ClaudeAPIService.isValidApiKey(apiKey)) {
        setError('Please provide a valid Claude API key')
        setShowApiKeyInput(true)
        setIsAnalyzing(false)
        return
      }

      try {
        const claudeService = new ClaudeAPIService(apiKey)
        const analysisResponse = await claudeService.analyzeDesign({
          designData,
          analysisType: 'full',
          priority: 'all'
        })
        
        setFeedback(analysisResponse)
        setError(null)
      } catch (err) {
        setError('Failed to analyze design with Claude API. Please check your API key and try again.')
        console.error('Analysis error:', err)
      } finally {
        setIsAnalyzing(false)
      }
    })
  }, [apiKey])

  const handleAnalyze = () => {
    if (!apiKey || !ClaudeAPIService.isValidApiKey(apiKey)) {
      setError('Please provide a valid Claude API key')
      setShowApiKeyInput(true)
      return
    }
    
    setIsAnalyzing(true)
    setIsExtracting(true)
    setError(null)
    setFeedback(null)
    emit('ANALYZE_SELECTION')
  }

  const handleApiKeySubmit = () => {
    console.log('API Key submitted:', apiKey ? 'Present' : 'Empty')
    console.log('API Key length:', apiKey.length)
    console.log('API Key starts with sk-ant-:', apiKey.startsWith('sk-ant-'))
    
    if (ClaudeAPIService.isValidApiKey(apiKey)) {
      emit('SAVE_API_KEY', apiKey)
    } else {
      setError('Invalid API key format. Claude API keys must start with "sk-ant-" and be at least 20 characters long.')
      console.log('API Key validation failed')
    }
  }

  const handleShowApiKeyInput = () => {
    setShowApiKeyInput(true)
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
        Get AI-powered engineering feedback on your design's feasibility, implementation effort, and coordination requirements.
      </Text>
      
      {showApiKeyInput && (
        <div>
          <VerticalSpace space="medium" />
          <Text><strong>Claude API Key Required</strong></Text>
          <VerticalSpace space="extraSmall" />
          <Text>Enter your Anthropic Claude API key to enable design analysis:</Text>
          <VerticalSpace space="small" />
          <Textbox
            placeholder="sk-ant-..."
            value={apiKey}
            onValueInput={setApiKey}
            password
          />
          <VerticalSpace space="small" />
          <Button onClick={() => {
            console.log('Save API Key button clicked')
            handleApiKeySubmit()
          }} fullWidth>
            Save API Key
          </Button>
        </div>
      )}
      
      {!showApiKeyInput && apiKey && (
        <div>
          <VerticalSpace space="small" />
          <Text style={{ fontSize: '11px', color: '#666' }}>
            API Key configured ✓ 
            <span 
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleShowApiKeyInput}
            >
              Change
            </span>
          </Text>
        </div>
      )}
      
      <VerticalSpace space="medium" />
      
      <Button 
        fullWidth 
        onClick={handleAnalyze} 
        disabled={isAnalyzing || isExtracting || showApiKeyInput}
      >
        {isExtracting ? 'Extracting Design Data...' : isAnalyzing ? 'Analyzing with Claude...' : 'Analyze Selection'}
      </Button>
      
      {(isAnalyzing || isExtracting) && (
        <div>
          <VerticalSpace space="medium" />
          <LoadingIndicator />
          <VerticalSpace space="small" />
          <Text style={{ fontSize: '11px', textAlign: 'center' }}>
            {isExtracting ? 'Extracting design data...' : 'Analyzing with Claude API...'}
          </Text>
        </div>
      )}
      
      {error && (
        <div>
          <VerticalSpace space="medium" />
          <Text style={{ color: '#f24822' }}>
            {error}
          </Text>
        </div>
      )}
      
      {feedback && (
        <div>
          <VerticalSpace space="medium" />
          
          <Text><strong>Feasibility (Score: {feedback.feasibility.score}/10)</strong></Text>
          <VerticalSpace space="extraSmall" />
          <Text>{feedback.feasibility.technical}</Text>
          
          {feedback.feasibility.challenges.length > 0 && (
            <div>
              <VerticalSpace space="extraSmall" />
              <Text style={{ fontSize: '11px', fontWeight: 'bold' }}>Challenges:</Text>
              {feedback.feasibility.challenges.map((challenge, index) => (
                <Text key={index} style={{ fontSize: '11px' }}>• {challenge}</Text>
              ))}
            </div>
          )}
          
          <VerticalSpace space="small" />
          
          <Text><strong>Implementation Effort</strong></Text>
          <VerticalSpace space="extraSmall" />
          <Text>{feedback.effort.hours} hours • {feedback.effort.storyPoints} story points • {feedback.effort.complexity} complexity</Text>
          
          {feedback.effort.breakdown.length > 0 && (
            <div>
              <VerticalSpace space="extraSmall" />
              {feedback.effort.breakdown.map((item, index) => (
                <Text key={index} style={{ fontSize: '11px' }}>• {item.category}: {item.hours}h - {item.description}</Text>
              ))}
            </div>
          )}
          
          <VerticalSpace space="small" />
          
          <Text><strong>Cross-team Coordination</strong></Text>
          <VerticalSpace space="extraSmall" />
          <Text>Teams: {feedback.coordination.teams.join(', ')}</Text>
          <Text>Timeline: {feedback.coordination.timeline}</Text>
          
          {feedback.recommendations.length > 0 && (
            <div>
              <VerticalSpace space="small" />
              <Text><strong>Recommendations</strong></Text>
              <VerticalSpace space="extraSmall" />
              {feedback.recommendations.map((rec, index) => (
                <div key={index}>
                  <Text style={{ fontSize: '11px', fontWeight: 'bold' }}>{rec.type} ({rec.priority})</Text>
                  <Text style={{ fontSize: '11px' }}>• {rec.description}</Text>
                </div>
              ))}
            </div>
          )}
          
          {feedback.risks.length > 0 && (
            <div>
              <VerticalSpace space="small" />
              <Text><strong>Risks</strong></Text>
              <VerticalSpace space="extraSmall" />
              {feedback.risks.map((risk, index) => (
                <div key={index}>
                  <Text style={{ fontSize: '11px', fontWeight: 'bold' }}>{risk.category} ({risk.severity})</Text>
                  <Text style={{ fontSize: '11px' }}>• {risk.description}</Text>
                  <Text style={{ fontSize: '10px', color: '#666' }}>Mitigation: {risk.mitigation}</Text>
                </div>
              ))}
            </div>
          )}
          
          <VerticalSpace space="small" />
          <Text style={{ fontSize: '10px', color: '#666' }}>Confidence: {Math.round(feedback.confidence * 100)}%</Text>
        </div>
      )}
      
      <VerticalSpace space="medium" />
      
      <Button fullWidth secondary onClick={handleClose}>
        Close
      </Button>
    </Container>
  )
}

export default render(Plugin)