# CodeMate AI - Quick Start Guide

Welcome to CodeMate AI! This guide will help you get everything up and running in minutes.

## Project Structure

```
CodeMate-AI/
├── cmate-front/         # VSCode Extension (TypeScript)
│   ├── src/            # Source code
│   ├── .vscode/        # Debug configuration
│   ├── package.json    # Dependencies & metadata
│   └── README.md       # Frontend documentation
│
├── cmate-back/         # Backend Service (Python)
│   ├── main.py         # FastAPI server
│   ├── command_parser.py
│   ├── file_operations.py
│   ├── browser_manager.py
│   ├── requirements.txt
│   ├── start.sh        # Linux/Mac startup
│   ├── start.bat       # Windows startup
│   └── README.md       # Backend documentation
│
├── QUICKSTART.md       # This file
└── README.md           # Main documentation
```

## Prerequisites

### Frontend
- Node.js 16+ and npm
- VSCode 1.70+

### Backend
- Python 3.11+
- pip

## Installation & Running

### Step 1: Terminal 1 - Start Backend

```bash
cd cmate-back

# Linux/Mac
./start.sh

# OR Windows
start.bat

# OR manually
python3 -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows
pip install -r requirements.txt
playwright install chromium
python main.py
```

**Expected output:**
```
... 
[INFO] CodeMate AI Backend starting...
[INFO] Browser manager initialized successfully
[INFO] Starting server on 0.0.0.0:8080
```

✅ Backend is ready when you see: `Uvicorn running on http://0.0.0.0:8080`

### Step 2: Terminal 2 - Develop Frontend

```bash
cd cmate-front

# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run watch
```

### Step 3: Debug Extension in VSCode

1. In the `cmate-front` folder, open VSCode
2. Press **F5** to start the Extension Development Host
3. A new VSCode window will open with the extension loaded
4. Open the Command Palette (`Ctrl+Shift+P`)
5. Type "CodeMate AI" to see available commands

## Testing Locally

### Start Commands in Extension

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "CodeMate AI: Create File"
3. Select an AI assistant (Claude, Gemini, ChatGPT)
4. Enter a filename: `test.txt`
5. Check the output panel for response

### Monitor Backend

Watch the backend terminal for logs:
```
[INFO] Received: Claude -> $create test.txt
[INFO] Created file: test.txt
```

Check the output channel in VSCode for responses.

## Configuration

### Backend (.env)

Edit `cmate-back/.env`:
```env
HOST=0.0.0.0
PORT=8080
WORKSPACE_ROOT=.
ENV=development
```

### Frontend (VSCode Settings)

Set in `.vscode/settings.json` or VSCode settings:
```json
{
  "codemate.backendUrl": "ws://localhost:8080",
  "codemate.language": "auto"
}
```

## Common Commands

### Create File
```
Command: CodeMate AI: Create File
Input: $create src/app.py
```

### Delete File
```
Command: CodeMate AI: Delete File
Select: src/app.py
```

### Modify File
```
Command: CodeMate AI: Modify File
Select: src/app.py
Content: print("Hello World")
```

### Run File
```
Command: CodeMate AI: Run File
Select: src/app.py
```

## Supported File Types for $run

- `.py` - Python (runs with `python3`)
- `.sh` - Shell scripts (runs with `bash`)
- `.js` - JavaScript (runs with `node`, requires Node.js)

## Browser Automation

The backend opens three AI assistant tabs on startup:
1. **Gemini** - https://gemini.google.com
2. **Claude** - https://claude.ai
3. **ChatGPT** - https://chat.openai.com

These are managed by Playwright and ready for browser automation features.

## Troubleshooting

### Port 8080 Already in Use

```bash
# Use a different port
PORT=9000 python main.py
```

or edit `.env`:
```env
PORT=9000
```

### Playwright Installation Issues

```bash
# Reinstall Playwright
pip install --force-reinstall playwright
playwright install chromium
```

### Extension Not Connecting

1. Verify backend is running: `http://localhost:8080/health`
2. Check frontend console for connection errors
3. Verify `codemate.backendUrl` in VSCode settings

### Python Not Found

```bash
# Install Python 3.11+
# macOS: brew install python3
# Ubuntu: sudo apt install python3.11
# Windows: Download from python.org
```

## Next Steps

- Read [cmate-front/README.md](./cmate-front/README.md) for extension details
- Read [cmate-back/README.md](./cmate-back/README.md) for backend API documentation
- Check out the source code in `src/` directories
- Run both in development mode with hot reload

## Support

For issues or questions:
1. Check the README files in each folder
2. Review logging output in both terminals
3. Check VSCode output channel (CodeMate AI)
4. Look at error messages in backend logs

---

**Ready to go?** Start both terminals and press F5! 🚀
