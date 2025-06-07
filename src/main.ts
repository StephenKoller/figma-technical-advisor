import { showUI, on, emit } from '@create-figma-plugin/utilities'
import { DesignExtractor } from './design-extractor-simple'

// Show the plugin UI when the plugin is launched
export default function () {
  showUI({ height: 480, width: 360 })
  
  // Listen for messages from the UI
  on('ANALYZE_SELECTION', handleAnalyzeSelection)
  on('CLOSE_PLUGIN', handleClosePlugin)
  on('SAVE_API_KEY', handleSaveApiKey)
  on('GET_API_KEY', handleGetApiKey)
}

async function handleAnalyzeSelection() {
  const selection = figma.currentPage.selection
  
  if (selection.length === 0) {
    emit('NO_SELECTION')
    return
  }

  try {
    emit('EXTRACTION_STARTED')
    
    // Use the enhanced design extractor
    const extractor = new DesignExtractor()
    const designData = await extractor.extractDesignData(selection)
    
    // Send the comprehensive design data to the UI for Claude API processing
    emit('DESIGN_EXTRACTED', designData)
  } catch (error) {
    console.error('Design extraction failed:', error)
    emit('EXTRACTION_ERROR', error instanceof Error ? error.message : 'Unknown extraction error')
  }
}

function handleClosePlugin() {
  figma.closePlugin()
}

async function handleSaveApiKey(apiKey: string) {
  try {
    await figma.clientStorage.setAsync('claude-api-key', apiKey)
    emit('API_KEY_SAVED', true)
  } catch (error) {
    console.error('Failed to save API key:', error)
    emit('API_KEY_SAVED', false)
  }
}

async function handleGetApiKey() {
  try {
    const apiKey = await figma.clientStorage.getAsync('claude-api-key')
    emit('API_KEY_RETRIEVED', apiKey || null)
  } catch (error) {
    console.error('Failed to retrieve API key:', error)
    emit('API_KEY_RETRIEVED', null)
  }
}