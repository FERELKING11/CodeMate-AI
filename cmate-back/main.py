import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from command_parser import CommandParser, CommandType
from file_operations import FileOperations
from browser_manager import BrowserManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CodeMate AI Backend",
    description="Backend service for CodeMate AI VSCode extension",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
workspace_root = os.getenv("WORKSPACE_ROOT", ".")
file_ops = FileOperations(workspace_root)
browser_manager = BrowserManager()


@app.on_event("startup")
async def startup_event():
    """Initialize browser on startup"""
    logger.info("CodeMate AI Backend starting...")
    success, message = await browser_manager.initialize()
    logger.info(f"Browser initialization: {message}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("CodeMate AI Backend shutting down...")
    await browser_manager.close()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    browser_ok, browser_msg = await browser_manager.health_check()
    return JSONResponse({
        "status": "ok" if browser_ok else "degraded",
        "browser": browser_msg,
        "workspace_root": str(workspace_root)
    })


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for CodeMate AI commands

    Expected message format:
    {
        "assistant": "Claude|Gemini|ChatGPT",
        "instruction": "$create|$delete|$modify|$run <filepath> [content]"
    }
    """
    await websocket.accept()
    logger.info("WebSocket client connected")

    try:
        while True:
            # Receive message from frontend
            data = await websocket.receive_text()

            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_text(
                    json.dumps({
                        "status": "error",
                        "message": "Invalid JSON format"
                    })
                )
                continue

            # Extract fields
            assistant = message.get("assistant", "").strip()
            instruction = message.get("instruction", "").strip()

            logger.info(f"Received: {assistant} -> {instruction}")

            if not assistant or not instruction:
                await websocket.send_text(
                    json.dumps({
                        "status": "error",
                        "message": "Missing 'assistant' or 'instruction' field"
                    })
                )
                continue

            # Parse command
            parsed = CommandParser.parse(instruction)
            valid, error = CommandParser.validate(parsed)

            if not valid:
                await websocket.send_text(
                    json.dumps({
                        "status": "error",
                        "message": error
                    })
                )
                continue

            # Execute command
            command = parsed["command"]
            filepath = parsed["filepath"]
            content = parsed.get("content", "")

            response = await execute_command(
                assistant=assistant,
                command=command,
                filepath=filepath,
                content=content
            )

            # Send response back
            await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_text(
                json.dumps({
                    "status": "error",
                    "message": f"Server error: {str(e)}"
                })
            )
        except:
            pass


async def execute_command(
    assistant: str,
    command: CommandType,
    filepath: str,
    content: str = ""
) -> dict:
    """
    Execute file operation command

    Args:
        assistant: AI assistant name
        command: CommandType enum
        filepath: File path
        content: File content (for modify)

    Returns:
        dict: Response with status and message
    """
    try:
        if command == CommandType.CREATE:
            success, message = file_ops.create_file(filepath, content)
        elif command == CommandType.DELETE:
            success, message = file_ops.delete_file(filepath)
        elif command == CommandType.MODIFY:
            success, message = file_ops.modify_file(filepath, content)
        elif command == CommandType.RUN:
            success, message = file_ops.run_file(filepath)
        else:
            return {
                "status": "error",
                "message": f"Unknown command: {command}"
            }

        return {
            "status": "success" if success else "error",
            "message": message,
            "assistant": assistant,
            "command": command.value,
            "filepath": filepath
        }
    except Exception as e:
        logger.error(f"Command execution error: {str(e)}")
        return {
            "status": "error",
            "message": f"Command failed: {str(e)}",
            "assistant": assistant,
            "command": command.value
        }


if __name__ == "__main__":
    import uvicorn

    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))
    reload = os.getenv("ENV", "development") == "development"

    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port, reload=reload)
