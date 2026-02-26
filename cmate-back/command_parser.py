import re
import logging
from enum import Enum
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class CommandType(Enum):
    """Supported command types"""
    CREATE = "create"
    DELETE = "delete"
    MODIFY = "modify"
    RUN = "run"


class CommandParser:
    """Parse and validate commands from frontend"""
    # Regex patterns for command validation
    PATTERNS = {
        CommandType.CREATE: r"^\$create\s+(.+)$",
        CommandType.DELETE: r"^\$delete\s+(.+)$",
        CommandType.MODIFY: r"^\$modify\s+(\S+)\s+(.*)$",
        CommandType.RUN: r"^\$run\s+(.+)$",
    }

    @staticmethod
    def parse(instruction: str) -> Dict[str, Any]:
        """
        Parse instruction string into command structure

        Format:
        - $create <filepath>
        - $delete <filepath>
        - $modify <filepath> <content>
        - $run <filepath>

        Args:
            instruction: Raw instruction string

        Returns:
            dict with keys: command (CommandType), filepath, content (optional)
        """
        instruction = instruction.strip()

        for cmd_type, pattern in CommandParser.PATTERNS.items():
            match = re.match(pattern, instruction)
            if match:
                result = {
                    "command": cmd_type,
                    "filepath": "",
                    "content": ""
                }

                groups = match.groups()
                if cmd_type == CommandType.MODIFY:
                    result["filepath"] = groups[0].strip()
                    result["content"] = groups[1].strip() if len(groups) > 1 else ""
                elif cmd_type == CommandType.CREATE:
                    result["filepath"] = groups[0].strip()
                else:
                    result["filepath"] = groups[0].strip()

                logger.info(f"Parsed command: {cmd_type.value} -> {result['filepath']}")
                return result

        logger.warning(f"Could not parse instruction: {instruction}")
        return {
            "command": None,
            "filepath": "",
            "content": ""
        }

    @staticmethod
    def validate(parsed: Dict[str, Any]) -> tuple[bool, str]:
        """
        Validate parsed command

        Args:
            parsed: Parsed command dictionary

        Returns:
            tuple: (is_valid, error_message)
        """
        if not parsed.get("command"):
            return False, "Unknown command. Use: $create, $delete, $modify, or $run"

        if not parsed.get("filepath"):
            return False, f"Missing filepath for {parsed['command'].value} command"

        # Validate filepath is not empty and doesn't contain dangerous patterns
        filepath = parsed["filepath"]
        if not filepath or filepath == ".":
            return False, "Invalid filepath"

        # Prevent directory traversal attacks
        if ".." in filepath or filepath.startswith("/"):
            return False, "Path traversal not allowed"

        # For modify, content is required
        if parsed["command"] == CommandType.MODIFY:
            if not parsed.get("content"):
                return False, "Content is required for modify command"

        return True, ""
