# CodeMate AI - VSCode Extension

A professional VSCode extension that integrates with Gemini, Claude, and ChatGPT to create, modify, delete, and run files directly from your IDE.

## Features

✨ **Multi-AI Support**: Choose between Gemini, Claude, or ChatGPT for each operation

🚀 **Real-time Communication**: WebSocket-based connection to the backend service with automatic reconnection

🌍 **Multi-Language**: Full support for English and Français (French) with automatic language detection

🎨 **Theme-Aware**: Seamlessly works with VSCode's dark and light themes

⚡ **Four Core Commands**:
- **Create File**: Generate new files with AI assistance
- **Delete File**: Remove files from your workspace
- **Modify File**: Update existing file contents
- **Run File**: Execute files through the backend service

## Installation

1. Clone or extract the extension folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the TypeScript:
   ```bash
   npm run build
   ```

## Development

### Build and Watch
```bash
npm install
npm run build        # One-time build
npm run watch       # Watch mode for development
```

### Debug
Press **F5** in VSCode to launch the Extension Development Host. The launch configuration is configured in `.vscode/launch.json` and will automatically compile the TypeScript before launching.

## Configuration

Configure CodeMate AI in VSCode settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `codemate.backendUrl` | string | `ws://localhost:8080` | WebSocket URL for the backend service |
| `codemate.language` | string | `auto` | UI language: `auto` (detects VSCode language), `en` (English), or `fr` (Français) |

Example in `.vscode/settings.json`:
```json
{
  "codemate.backendUrl": "ws://localhost:8080",
  "codemate.language": "auto"
}
```

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS)
2. Search for any of the CodeMate commands:
   - `CodeMate AI: Create File`
   - `CodeMate AI: Delete File`
   - `CodeMate AI: Modify File`
   - `CodeMate AI: Run File`
3. Select your preferred AI assistant (Gemini, Claude, or ChatGPT)
4. Provide the required input (filename, file path, or content)
5. The command will be sent to the backend and executed

## Backend Communication Protocol

The extension communicates with the backend via WebSocket using JSON messages:

**Request Format:**
```json
{
  "assistant": "Claude",
  "instruction": "$create src/newFile.ts"
}
```

Supported instructions:
- `$create <filename>` - Create a new file
- `$delete <filepath>` - Delete a file
- `$modify <filepath> <content>` - Modify file content
- `$run <filepath>` - Execute a file

**Response Format:**
Responses from the backend are plain text strings displayed in:
- The CodeMate AI output channel
- VSCode information notifications

## Architecture

```
src/
├── extension.ts         # Main extension entry, command registration
├── websocketClient.ts   # WebSocket client with auto-reconnect
├── localization.ts      # i18n system
└── locales/
    ├── en.json          # English strings
    └── fr.json          # French strings
```

## Dependencies

- **ws** - WebSocket client library for Node.js (VSCode extension host)
- **vscode** - VSCode extension API
- **typescript** - Language compilation
- **@types/node** - Node.js type definitions
- **@types/ws** - WebSocket type definitions

## Notes

- The extension requires a backend service running at the configured WebSocket URL
- The backend is responsible for executing file operations and managing browser automation
- Messages are sent asynchronously with proper error handling
- Automatic reconnection with exponential backoff (1s → 30s max)
