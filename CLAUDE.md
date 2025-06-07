# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Figma Technical Advisor is a Figma plugin that provides real-time engineering feedback on design feasibility, implementation effort, and cross-team coordination requirements. The plugin analyzes design mockups and uses the Claude API to generate actionable engineering insights, shortening the designer-developer feedback loop.

## Architecture

### Core Components

1. **Figma Plugin** (TypeScript)
   - Runs within Figma's plugin environment
   - Extracts design data from selected frames/components
   - Manages user interface for feedback display
   - Handles periodic analysis triggers

2. **Design Export Engine**
   - Converts Figma design elements to analyzable format
   - Options: Design snapshots (images) vs AST-like structure
   - Includes component hierarchy, styles, and layout information

3. **Claude API Integration**
   - Processes design exports with engineering-focused prompts
   - Returns structured feedback on feasibility, effort, and coordination needs
   - Handles API authentication and rate limiting

4. **Feedback Display System**
   - Presents engineering insights within Figma UI
   - Categorizes feedback by priority and complexity
   - Provides actionable recommendations

### Data Flow

Design Selection → Export Generation → Claude API Analysis → Feedback Display

## Development Setup

This repository is currently in initial setup phase. Development commands will be added as the project structure is established.

## Key Considerations

- Figma plugin security and permissions model
- Claude API rate limiting and cost optimization  
- Design data privacy and handling
- Real-time vs batch analysis modes