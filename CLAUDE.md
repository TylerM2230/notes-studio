# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Teaching Notes Studio is a browser-based React application for educators to create, manage, and batch-process student observation notes. The app uses CDN-delivered dependencies and runs entirely in the browser without a build process.

## Development Setup

No build process required - this is a static web application:

1. Open `index.html` directly in a web browser

## Architecture

### Core Components

- **Single-page React app** (`src/app.js`) - Complete application logic in one file
- **CDN dependencies** - React, Monaco Editor, Tailwind CSS, Font Awesome loaded via CDN
- **Template system** (`src/data/templates.js`) - Observation templates organized by category
- **Enhanced autocomplete system** - Multiple files in `src/data/` providing intelligent suggestions

### File Structure

```
├── index.html              # Main entry point with CDN links
├── src/
│   ├── app.js              # Complete React application (1000+ lines)
│   └── data/
│       ├── templates.js    # Observation templates and constants
│       ├── data-loader.js  # Enhanced data loading system
│       ├── suggestion-engine.js  # Intelligent suggestion engine
│       ├── monaco-integration.js # Monaco editor autocomplete
│       └── notes-analyzer.js     # Note analysis utilities
├── config/
│   ├── monaco-config.js    # Monaco Editor CDN configuration
│   └── app-config.js       # Error handling and environment setup
├── assets/
│   └── styles.css          # Custom CSS overrides and Monaco theming
└── scraped_notes.json      # Sample data for autocomplete system
```

### Key Features

- **Monaco Editor integration** with fallback to textarea
- **Template library** with 8 categories of observation templates
- **Batch processing** - collect multiple student notes and export to clipboard
- **Enhanced autocomplete** - context-aware suggestions based on educational data
- **Real-time statistics** - word count, concept tracking
- **Keyboard shortcuts** - Ctrl+Enter (add), Ctrl+E (export), Ctrl+R (clear), Ctrl+←/→ (cycle templates)

## Working with Templates

Template categories are defined in `OBSERVATION_TEMPLATES` object:

- `engagement` - Student participation and motivation
- `problemSolving` - Analytical and debugging skills
- `technicalProgress` - Programming concept mastery
- `challengingBehaviors` - Areas needing attention
- `avoidancePatterns` - Resistance to difficult tasks
- `disruptiveBehaviors` - Classroom management notes
- `criticalThinking` - Advanced reasoning skills
- `socialEmotional` - Collaboration and emotional regulation

## Monaco Editor Configuration

The app uses Monaco Editor with:

- Dark theme (`vs-dark`)
- Markdown language mode
- Custom completion providers for educational templates
- Fallback to enhanced textarea if Monaco fails to load
- Custom styling with Courier New font family

## State Management

All state managed with React hooks in the main component:

- `students` - Array of completed student observations
- `currentStudent` - Current student name being edited
- `currentNotes` - Current observation notes
- `activeTemplateTab` - Currently selected template category
- Monaco editor instance managed via `useRef`

## Styling System

- **Tailwind CSS** via CDN for utility classes
- **Custom CSS** in `assets/styles.css` for Monaco theming and overrides
- **Color scheme** - Dark blue theme (#1a2332) with orange accents (#ff6b35)
- **Responsive design** with grid layouts

## Data Flow

1. User enters student name and writes observations using Monaco editor
2. Templates can be inserted via click or autocomplete
3. Student added to batch with `addToBatch()`
4. Batch exported to clipboard with `processBatch()` in LLM-friendly format
5. Enhanced autocomplete suggests context-appropriate phrases from `scraped_notes.json`

## Error Handling

- Monaco Editor loading with multiple fallback strategies
- Console warning suppression for CDN usage (`config/app-config.js`)
- Graceful degradation to textarea if Monaco unavailable
- Enhanced autocomplete fallback to basic templates if data loading fails

## Testing

No formal test framework - test by opening `index.html` in browser and verifying:

- Monaco Editor loads and provides autocomplete
- Template insertion works via buttons and shortcuts
- Batch processing exports properly formatted text to clipboard
- All keyboard shortcuts function correctly
