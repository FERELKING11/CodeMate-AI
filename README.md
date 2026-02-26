# CodeMate AI - Professional Full-Stack AI Extension

A complete, production-ready VSCode extension that integrates with Gemini, Claude, and ChatGPT for intelligent file management and execution.

## 🎯 Overview

CodeMate AI is a dual-project workspace containing:
- **Frontend**: TypeScript VSCode extension with multi-language support
- **Backend**: Python FastAPI service with browser automation

Both projects are completely independent but work together through WebSocket communication.

## ✨ Key Features

### Frontend (VSCode Extension)
- 🌍 **Multi-Language**: English & Français with automatic detection
- 🎨 **Theme-Aware**: Works seamlessly with light/dark themes
- 🚀 **Real-Time**: WebSocket with automatic reconnection (exponential backoff)
- 📁 **File Management**: Create, delete, modify, run files
- 🤖 **Multi-AI**: Choose between Gemini, Claude, or ChatGPT per command

### Backend (Python Service)
- ⚡ **FastAPI**: Modern async Python framework
- 🔐 **Secure**: Path traversal prevention, input validation
- 🌐 **Browser Automation**: Playwright with 3 AI tabs
- 📝 **File Operations**: Safe create/delete/modify/execute with 30s timeout
- 📊 **Health Checks**: Monitor browser and file system status

## 📦 Project Structure

```
CodeMate-AI/
├── cmate-front/
│   ├── src/
│   │   ├── extension.ts         # Main extension entry point
│   │   ├── websocketClient.ts   # WebSocket client with auto-reconnect
│   │   ├── localization.ts      # i18n system
│   │   └── locales/
│   │       ├── en.json          # English strings
│   │       └── fr.json          # French strings
│   ├── .vscode/
│   │   ├── launch.json          # Debug configuration
│   │   └── tasks.json           # Build tasks
│   ├── package.json             # Dependencies & metadata
│   ├── tsconfig.json            # TypeScript config
│   └── README.md                # Frontend documentation
│
├── cmate-back/
│   ├── main.py                  # FastAPI application
│   ├── command_parser.py        # Command parsing & validation
│   ├── file_operations.py       # Safe file operations
│   ├── browser_manager.py       # Playwright browser control
│   ├── requirements.txt         # Python dependencies
│   ├── start.sh                 # Linux/Mac startup script
│   ├── start.bat                # Windows startup script
│   ├── .env.example             # Configuration template
│   └── README.md                # Backend documentation
│
├── QUICKSTART.md                # Quick start guide
└── README.md                    # This file
```

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### 30-Second Start

**Terminal 1 - Backend:**
```bash
cd cmate-back
./start.sh  # or: start.bat on Windows
```

**Terminal 2 - Frontend:**
```bash
cd cmate-front
npm install
npm run watch
# Then press F5 in VSCode to debug
```

## 📋 Requirements

### Frontend
- Node.js 16+
- npm 7+
- VSCode 1.70+

### Backend
- Python 3.11+
- pip
- Playwright (downloads browsers automatically)

## 🎮 Usage

### In VSCode Extension Development Host

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "CodeMate AI" to see commands:
   - Create File
   - Delete File
   - Modify File
   - Run File

3. Select command → Choose AI assistant → Provide input

4. View results in:
   - Output channel: "CodeMate AI"
   - Information notifications
   - Backend logs in terminal

### Example Workflow

```
1. Command: CodeMate AI: Create File
   ↓
2. Select: Claude
   ↓
3. Enter: src/app.py
   ↓
4. WebSocket sends: {"assistant": "Claude", "instruction": "$create src/app.py"}
   ↓
5. Backend parses, validates, and creates file
   ↓
6. Response: {"status": "success", "message": "File created: src/app.py"}
   ↓
7. VSCode displays notification and logs response
```

## 🔌 API Communication

### Message Format

**Frontend → Backend:**
```json
{
  "assistant": "Claude|Gemini|ChatGPT",
  "instruction": "$create|$delete|$modify|$run <filepath> [content]"
}
```

**Backend → Frontend:**
```json
{
  "status": "success|error",
  "message": "Operation result",
  "assistant": "Claude",
  "command": "create",
  "filepath": "src/app.py"
}
```

### Supported Commands

| Command | Format | Example |
|---------|--------|---------|
| Create | `$create <path>` | `$create main.py` |
| Delete | `$delete <path>` | `$delete main.py` |
| Modify | `$modify <path> <content>` | `$modify main.py print('hi')` |
| Run | `$run <path>` | `$run main.py` |

## 🛠️ Development

### Frontend Development

```bash
cd cmate-front

# Install dependencies
npm install

# Build once
npm run build

# Watch for changes
npm run watch

# Debug in VSCode (press F5)
```

### Backend Development

```bash
cd cmate-back

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright
playwright install chromium

# Run with auto-reload
python main.py
```

## 🔒 Security Features

- ✅ Path traversal prevention (`..` and absolute paths blocked)
- ✅ Workspace-bound operations (confined to `WORKSPACE_ROOT`)
- ✅ Input validation with regex patterns
- ✅ Safe subprocess execution with 30-second timeout
- ✅ No arbitrary command execution

## 📚 Documentation

- **[Frontend README](./cmate-front/README.md)** - Extension API, configuration, architecture
- **[Backend README](./cmate-back/README.md)** - Server API, file operations, Playwright details
- **[QUICKSTART.md](./QUICKSTART.md)** - Setup and first steps

## ⚙️ Configuration

### Backend (`.env`)
```env
HOST=0.0.0.0
PORT=8080
WORKSPACE_ROOT=.
ENV=development
LOG_LEVEL=INFO
```

### Frontend (VSCode Settings)
```json
{
  "codemate.backendUrl": "ws://localhost:8080",
  "codemate.language": "auto"
}
```

## 🧪 Testing

### Test WebSocket Directly
```bash
npm install -g wscat
wscat -c ws://localhost:8080
```

Send message:
```json
{"assistant": "Claude", "instruction": "$create test.txt"}
```

### Health Check
```bash
curl http://localhost:8080/health
```

## 📝 Supported File Types for `$run`

- **Python** (`.py`) - Runs with `python3`
- **Shell** (`.sh`) - Runs with `bash`
- **Node.js** (`.js`) - Runs with `node` (requires Node.js)

Maximum execution time: **30 seconds**

## 🌐 Browser Automation

Backend maintains three browser tabs:
1. **Gemini** - `https://gemini.google.com`
2. **Claude** - `https://claude.ai`
3. **ChatGPT** - `https://chat.openai.com`

Managed by Playwright (Chromium). Ready for AI interaction features.

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python3 --version  # Must be 3.11+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Reset Playwright
playwright install chromium
```

### Extension Won't Connect
1. Verify backend running: http://localhost:8080/health
2. Check `codemate.backendUrl` setting
3. Look at "CodeMate AI" output channel in VSCode
4. Check browser console (F12) in Extension Development Host

### Port Already in Use
```bash
# Change port in .env or use environment variable
PORT=9000 python main.py
```

## 📦 Build & Release

### Package Extension (.vsix)
```bash
cd cmate-front
npm run build
vsce package  # Requires vsce: npm install -g vsce
```

## 🎯 Project Status

✅ **Complete & Production-Ready**
- Frontend: Full TypeScript extension with i18n
- Backend: FastAPI server with Playwright
- Security: Path validation and input sanitization
- Documentation: Comprehensive guides and READMEs

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- Check documentation in README files
- Review log output in both terminals
- Check VSCode "CodeMate AI" output channel
- Look at backend logs for detailed error messages

---

**Ready to use?** See [QUICKSTART.md](./QUICKSTART.md) for setup! 🚀
