# Figma Technical Advisor

An AI-powered Figma plugin that provides real-time engineering feedback on design feasibility, implementation effort, and cross-team coordination requirements. Bridge the gap between design and development with intelligent analysis powered by Claude AI.

## 🎯 Core Concept

The Figma Technical Advisor analyzes your design selections and provides actionable engineering insights to help designers understand:

- **Feasibility** - How technically viable is this design with current web technologies?
- **Implementation Effort** - What's the realistic timeline and complexity for development?
- **Team Coordination** - Which teams and dependencies are required for implementation?
- **Technical Risks** - What challenges might arise during development?
- **Optimization Recommendations** - How can the design be improved for easier implementation?

### How It Works

1. **Design Analysis** - Select any design element in Figma (components, frames, pages)
2. **Data Extraction** - Plugin extracts comprehensive design data including:
   - Node hierarchy and structure
   - Component usage and variants
   - Layout complexity (auto-layout, constraints)
   - Design system integration
   - Interactive elements
3. **AI Processing** - Data is sent to Claude AI with engineered prompts for engineering analysis
4. **Actionable Feedback** - Receive detailed insights directly in Figma with:
   - Feasibility score (1-10)
   - Hour estimates and story points
   - Team coordination requirements
   - Risk assessment with mitigation strategies
   - Specific recommendations for optimization

## 🚀 Getting Started

### Prerequisites

- **Figma Desktop App** (required for plugin development/testing)
- **Node.js 16+** and npm
- **Claude API Key** from [Anthropic Console](https://console.anthropic.com/)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/StephenKoller/figma-technical-advisor.git
   cd figma-technical-advisor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the plugin**
   ```bash
   npm run build
   ```

4. **Install in Figma**
   - Open Figma Desktop App
   - Use Quick Actions (`Cmd/Ctrl + /`) 
   - Type "Import plugin from manifest"
   - Select the generated `manifest.json` file from this project
   - Plugin will appear in your Plugins menu as "Technical Advisor"

### Getting Your Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

**Cost**: Analysis typically costs ~$0.16 per design evaluation with current Claude pricing.

## 🔧 Usage

### Running Analysis

1. **Open any Figma file** with designs you want to analyze
2. **Select design elements** - components, frames, or entire pages
3. **Launch the plugin** from Plugins menu → "Technical Advisor"
4. **Configure API key** (first time only):
   - Plugin will prompt for your Claude API key
   - Key is stored securely in browser localStorage
   - Can be changed anytime via the plugin interface
5. **Click "Analyze Selection"** to get engineering feedback

### Understanding the Results

The plugin provides comprehensive feedback in several categories:

#### **Feasibility Analysis**
- **Score (1-10)**: Overall technical feasibility rating
- **Assessment**: Detailed explanation of implementation viability
- **Challenges**: Specific technical hurdles identified
- **Alternatives**: Suggested approaches for difficult implementations

#### **Implementation Effort**
- **Time Estimate**: Hours and story points for development
- **Complexity Level**: Low/Medium/High classification
- **Breakdown**: Detailed effort distribution across categories (development, testing, review)

#### **Team Coordination**
- **Required Teams**: Frontend, Design System, QA, etc.
- **Dependencies**: External requirements and blockers
- **Timeline**: Suggested project timeline
- **Critical Path**: Key sequence of implementation steps

#### **Recommendations**
- **Optimization suggestions** for easier implementation
- **Alternative approaches** for complex features
- **Phasing strategies** for large implementations
- **Tooling recommendations** for development efficiency

#### **Risk Assessment**
- **Technical risks** with severity levels
- **Mitigation strategies** for each identified risk
- **Confidence score** for the overall analysis

## 🛠 Development

### Development Commands

```bash
# Build for production
npm run build

# Watch mode for development (rebuilds on file changes)
npm run watch
npm run dev

# Type checking only
npx tsc --noEmit
```

### Plugin Development Workflow

1. **Make code changes** in the `src/` directory
2. **Run `npm run watch`** for auto-rebuilding during development
3. **Reload plugin in Figma** to test changes:
   - Right-click on the plugin in Figma
   - Select "Reload plugin"
4. **Test with various design selections** to ensure robustness

### Project Structure

```
figma-technical-advisor/
├── src/
│   ├── main.ts                    # Plugin main thread (Figma API access)
│   ├── ui.tsx                     # Plugin UI thread (React interface)
│   ├── claude-api.ts              # Claude API integration service
│   ├── design-extractor-simple.ts # Design data extraction engine
│   └── types.ts                   # TypeScript type definitions
├── build/                         # Generated plugin files
├── manifest.json                  # Generated plugin manifest
├── package.json                   # Project configuration
├── tsconfig.json                  # TypeScript configuration
├── CLAUDE.md                      # Claude Code documentation
└── README.md                      # This file
```

### Architecture Overview

The plugin uses a **hybrid analysis approach** for optimal results:

- **70% Structured Data**: Extracts detailed design properties, component relationships, layout complexity
- **30% Visual Context**: Selective image snapshots for complex layouts requiring visual analysis
- **Engineered Prompts**: Specialized prompts that provide Claude with comprehensive context for accurate engineering assessment

## 🔒 Security & Privacy

- **API Key Storage**: Claude API keys are stored locally in browser localStorage
- **Data Privacy**: Design data is only sent to Anthropic's Claude API for analysis
- **Network Permissions**: Plugin only has access to `api.anthropic.com` for API calls
- **No Data Persistence**: No design data is stored or logged by the plugin

## 📊 Cost Optimization

The plugin is optimized for cost-effective usage:

- **Smart Data Extraction**: Only extracts relevant design information
- **Efficient Prompting**: Structured prompts minimize token usage
- **Selective Image Analysis**: Images only used when necessary for complex layouts
- **Estimated Cost**: ~$0.16 per comprehensive design analysis

## 🐛 Troubleshooting

### Common Issues

**Plugin doesn't appear in Figma**
- Ensure you're using Figma Desktop App (plugins don't work in browser version)
- Check that `manifest.json` was generated by running `npm run build`
- Try reimporting the plugin manifest

**"Invalid API Key" error**
- Verify your Claude API key starts with `sk-ant-`
- Check that the key has proper permissions in Anthropic Console
- Try generating a new API key

**Analysis fails or returns generic results**
- Ensure you have design elements selected in Figma
- Check browser console for detailed error messages
- Verify you have sufficient Claude API credits

**Build errors**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 16+)
- Clear build cache with `rm -rf build/` and rebuild

### Getting Help

- **File issues**: [GitHub Issues](https://github.com/StephenKoller/figma-technical-advisor/issues)
- **Claude API docs**: [Anthropic Documentation](https://docs.anthropic.com/)
- **Figma plugin docs**: [Figma Plugin API](https://www.figma.com/plugin-docs/)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with proper TypeScript types
4. **Test thoroughly** with various design selections
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow existing TypeScript patterns and type definitions
- Test with various design complexities and edge cases
- Maintain cost-efficiency in API usage
- Update documentation for new features
- Ensure proper error handling and user feedback

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for Claude AI API enabling intelligent design analysis
- **Figma** for the comprehensive plugin platform and APIs
- **create-figma-plugin** toolkit for streamlined plugin development
- **Claude Code** for development assistance and architecture guidance

---

**Built with ❤️ to bridge the design-development gap and make better products faster.**