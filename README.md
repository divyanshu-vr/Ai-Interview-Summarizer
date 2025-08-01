# Real-Time Interview Summarizer

A desktop application for real-time meeting transcription and AI-powered summarization.

## Features

- Real-time audio capture from online meetings
- Speech-to-text conversion with live transcription
- AI-powered summarization using Google Gemini
- Document export in multiple formats (PDF, DOCX, TXT)
- Cross-platform support (Windows, macOS, Linux)
- Privacy-focused local processing

## Technology Stack

- **Framework**: Electron + React
- **UI Library**: Material-UI (MUI) + Tailwind CSS
- **Audio Processing**: Web Audio API, MediaRecorder API
- **Speech Recognition**: Web Speech API
- **AI Integration**: Google Gemini API
- **Document Generation**: jsPDF, docx
- **Storage**: IndexedDB, localStorage

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Scripts

- `npm start` - Start the development server (React + Electron)
- `npm run start:renderer` - Start only the React development server
- `npm run start:electron` - Start only the Electron app
- `npm run build` - Build the complete application
- `npm run build:renderer` - Build only the React app
- `npm run build:electron` - Build the Electron distribution
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:e2e` - Run end-to-end tests only
- `npm run test:setup` - Verify project setup

### Project Structure

```
src/
├── main/                    # Electron main process
│   ├── main.js             # Application entry point
│   └── preload.js          # Preload script for IPC
├── components/             # React components
│   └── Dashboard.jsx       # Main application interface
├── services/               # Business logic services
├── hooks/                  # Custom React hooks
├── assets/                 # Static assets
│   ├── icons/             # Application icons
│   └── templates/         # Export templates
└── App.js                 # React app entry point

tests/
├── setup/                  # Test configuration and setup
│   ├── setupTests.js      # Jest setup file
│   └── verify-setup.js    # Project setup verification
├── unit/                   # Unit tests
├── integration/            # Integration tests
├── e2e/                    # End-to-end tests
├── fixtures/               # Test data and fixtures
└── helpers/                # Test utility functions
```

## Current Status

✅ **Task 1 Complete**: Project foundation and development environment
- Electron + React project initialized
- Development tools configured (webpack, babel, eslint)
- Project directory structure established
- Core dependencies installed and configured
- Basic Electron main process with window management

### Next Steps

The following tasks are ready for implementation:
- Task 2: Implement basic audio capture infrastructure
- Task 3: Build audio capture UI controls and indicators
- Task 4: Implement speech-to-text conversion engine

## Requirements Addressed

This implementation addresses the following requirements:
- **6.5**: Cross-platform compatibility (Windows 10+, macOS 10.14+, Ubuntu 18.04+)
- **6.6**: Consistent user experience and functionality across operating systems

## License

MIT License