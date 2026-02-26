# CodeMate AI - Backend Service

FastAPI-based backend service for CodeMate AI VSCode extension. Handles WebSocket communication, file operations, and browser automation with Playwright.

## Features

🚀 **FastAPI Server** - Async WebSocket endpoint for real-time communication

📁 **File Operations** - Safe Create, Delete, Modify, and Run commands with path validation

🌐 **Browser Automation** - Playwright integration with three AI tabs (Gemini, Claude, ChatGPT)

🔒 **Security** - Path traversal protection, input validation, safe subprocess execution

## Requirements

- Python 3.11+
- FastAPI
- Playwright (with browser installation)
- Node.js (optional, for $run .js files)

## Installation

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Playwright browsers:**
   ```bash
   playwright install chromium
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings if needed
   ```

## Running the Server

```bash
python main.py
```

The server will start on `ws://localhost:8080` by default.

### Development Mode

```bash
# With auto-reload on file changes
python main.py
```

### Production Mode

Edit `.env` and set `ENV=production`, then run:
```bash
python main.py
```

### Using Uvicorn Directly

```bash
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

## API Endpoints

### WebSocket: `/ws`

**Receive Commands** - JSON format from frontend:
```json
{
  "assistant": "Claude",
  "instruction": "$create src/test.py"
}
```

**Send Response** - JSON with status and message:
```json
{
  "status": "success",
  "message": "File created: src/test.py",
  "assistant": "Claude",
  "command": "create",
  "filepath": "src/test.py"
}
```

### HTTP: `GET /health`

Health check endpoint. Returns:
```json
{
  "status": "ok",
  "browser": "Active tabs: Gemini, Claude, ChatGPT",
  "workspace_root": "/path/to/workspace"
}
```

## Supported Commands

| Command | Format | Example |
|---------|--------|---------|
| Create | `$create <filepath> [content]` | `$create main.py print('Hello')` |
| Delete | `$delete <filepath>` | `$delete main.py` |
| Modify | `$modify <filepath> <content>` | `$modify main.py print('Updated')` |
| Run | `$run <filepath>` | `$run main.py` |

### File Execution

The `$run` command supports:
- **Python** - `.py` files (runs with python3)
- **Shell** - `.sh` files (runs with bash)
- **JavaScript** - `.js` files (runs with node, requires Node.js installed)

### Security Features

- 🔐 **Path Validation** - Prevents directory traversal (`../`, absolute paths)
- ✅ **Workspace Bound** - All operations restricted to `WORKSPACE_ROOT`
- ⚠️ **Input Sanitization** - Command parsing with regex validation
- ⏱️ **Execution Timeout** - File execution limited to 30 seconds

## Architecture

```
cmate-back/
├── main.py              # FastAPI app and WebSocket handler
├── command_parser.py    # Command parsing and validation
├── file_operations.py   # Safe file system operations
├── browser_manager.py   # Playwright browser automation
├── requirements.txt     # Python dependencies
├── .env.example         # Configuration template
├── .gitignore          # Git ignore patterns
└── README.md           # This file
```

### Module Details

#### `main.py`
- FastAPI application setup
- WebSocket endpoint (`/ws`)
- Health check endpoint (`/health`)
- Request routing to command handler

#### `command_parser.py`
- Parses `$create`, `$delete`, `$modify`, `$run` instructions
- Validates filepath and content
- Prevents malicious patterns

#### `file_operations.py`
- Creates files with parent directory creation
- Deletes files safely (no directory deletion)
- Modifies files with backup creation
- Executes Python, Shell, and JavaScript files
- 30-second execution timeout

#### `browser_manager.py`
- Initializes Chromium browser with 3 tabs
- Manages pages for Gemini, Claude, ChatGPT
- Provides health status
- Handles browser lifecycle (init/close)

## Configuration

Edit `.env` file to customize:

```env
# Server address
HOST=0.0.0.0
PORT=8080

# Workspace root for file operations
WORKSPACE_ROOT=.

# Environment (development/production)
ENV=development

# Logging level
LOG_LEVEL=INFO
```

## Logging

Logs are written to console with timestamp and level:

```
2024-02-26 10:30:45,123 - main - INFO - CodeMate AI Backend starting...
2024-02-26 10:30:47,456 - browser_manager - INFO - Browser manager initialized successfully
2024-02-26 10:30:50,789 - main - INFO - Received: Claude -> $create test.py
```

## Error Handling

**Invalid Command:**
```json
{
  "status": "error",
  "message": "Unknown command. Use: $create, $delete, $modify, or $run"
}
```

**Path Traversal Attempt:**
```json
{
  "status": "error",
  "message": "Path traversal not allowed"
}
```

**File Not Found:**
```json
{
  "status": "error",
  "message": "File not found: src/missing.py"
}
```

**Execution Error:**
```json
{
  "status": "error",
  "message": "Error executing file: [detailed error]"
}
```

## Development

### Testing the WebSocket

Use `wscat` or similar tool:
```bash
npm install -g wscat
wscat -c ws://localhost:8080
```

Send commands:
```
# Create a file
{"assistant": "Claude", "instruction": "$create test.txt hello world"}

# Delete a file
{"assistant": "Gemini", "instruction": "$delete test.txt"}
```

### Debugging

Set logging to DEBUG level in `.env`:
```env
LOG_LEVEL=DEBUG
```

You'll see detailed logs for parsing, file operations, and browser states.

## Notes

- Browser tabs are created on startup with Playwright
- Path traversal attacks are blocked for security
- File execution is limited to .py, .sh, and .js
- Maximum execution time is 30 seconds
- All paths are relative to `WORKSPACE_ROOT`

## Troubleshooting

### Playwright Not Working
```bash
# Reinstall Playwright browsers
playwright install chromium
```

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=9000 python main.py
```

### WebSocket Connection Refused
- Ensure server is running: `python main.py`
- Check frontend configuration matches server URL
- Default: `ws://localhost:8080`

## License

Licensed under the MIT License.
