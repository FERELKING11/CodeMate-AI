import os
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class FileOperations:
    """Handle file system operations safely"""

    def __init__(self, workspace_root: str = "."):
        """
        Initialize file operations handler

        Args:
            workspace_root: Root directory for file operations
        """
        self.workspace_root = Path(workspace_root).resolve()
        logger.info(f"FileOperations initialized with root: {self.workspace_root}")

    def _resolve_safe_path(self, filepath: str) -> tuple[bool, Path]:
        """
        Resolve and validate filepath to prevent directory traversal

        Args:
            filepath: Requested filepath

        Returns:
            tuple: (is_safe, resolved_path)
        """
        try:
            # Resolve relative to workspace root
            requested = Path(filepath)
            resolved = (self.workspace_root / requested).resolve()

            # Ensure resolved path is within workspace root
            if not str(resolved).startswith(str(self.workspace_root)):
                logger.warning(f"Path traversal attempt detected: {filepath}")
                return False, None

            return True, resolved
        except Exception as e:
            logger.error(f"Path resolution error: {str(e)}")
            return False, None

    def create_file(self, filepath: str, content: str = "") -> tuple[bool, str]:
        """
        Create a new file

        Args:
            filepath: File path relative to workspace root
            content: File content

        Returns:
            tuple: (success, message)
        """
        try:
            safe, path = self._resolve_safe_path(filepath)
            if not safe:
                return False, f"Invalid path: {filepath}"

            # Create parent directories if needed
            path.parent.mkdir(parents=True, exist_ok=True)

            # Check if file already exists
            if path.exists():
                return False, f"File already exists: {filepath}"

            # Write file
            path.write_text(content, encoding="utf-8")
            logger.info(f"Created file: {filepath}")
            return True, f"File created: {filepath}"
        except Exception as e:
            logger.error(f"Error creating file: {str(e)}")
            return False, f"Error creating file: {str(e)}"

    def delete_file(self, filepath: str) -> tuple[bool, str]:
        """
        Delete a file

        Args:
            filepath: File path relative to workspace root

        Returns:
            tuple: (success, message)
        """
        try:
            safe, path = self._resolve_safe_path(filepath)
            if not safe:
                return False, f"Invalid path: {filepath}"

            # Check if file exists
            if not path.exists():
                return False, f"File not found: {filepath}"

            # Don't delete directories
            if path.is_dir():
                return False, f"Cannot delete directory: {filepath}"

            # Delete file
            path.unlink()
            logger.info(f"Deleted file: {filepath}")
            return True, f"File deleted: {filepath}"
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False, f"Error deleting file: {str(e)}"

    def modify_file(self, filepath: str, content: str) -> tuple[bool, str]:
        """
        Modify file content

        Args:
            filepath: File path relative to workspace root
            content: New file content

        Returns:
            tuple: (success, message)
        """
        try:
            safe, path = self._resolve_safe_path(filepath)
            if not safe:
                return False, f"Invalid path: {filepath}"

            # Check if file exists
            if not path.exists():
                return False, f"File not found: {filepath}"

            # Don't modify directories
            if path.is_dir():
                return False, f"Cannot modify directory: {filepath}"

            # Backup before modifying (optional)
            try:
                backup_path = path.with_suffix(path.suffix + ".bak")
                backup_path.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
            except Exception as e:
                logger.warning(f"Could not create backup: {str(e)}")

            # Write new content
            path.write_text(content, encoding="utf-8")
            logger.info(f"Modified file: {filepath}")
            return True, f"File modified: {filepath}"
        except Exception as e:
            logger.error(f"Error modifying file: {str(e)}")
            return False, f"Error modifying file: {str(e)}"

    def run_file(self, filepath: str) -> tuple[bool, str]:
        """
        Execute a file

        Supports: .py (Python), .sh (Shell), .js (Node.js)

        Args:
            filepath: File path relative to workspace root

        Returns:
            tuple: (success, output_message)
        """
        try:
            safe, path = self._resolve_safe_path(filepath)
            if not safe:
                return False, f"Invalid path: {filepath}"

            # Check if file exists
            if not path.exists():
                return False, f"File not found: {filepath}"

            # Check if it's a file (not directory)
            if not path.is_file():
                return False, f"Not a file: {filepath}"

            # Determine command based on file extension
            ext = path.suffix.lower()

            if ext == ".py":
                cmd = ["python3", str(path)]
            elif ext == ".sh":
                cmd = ["bash", str(path)]
            elif ext == ".js":
                cmd = ["node", str(path)]
            else:
                return False, f"Unsupported file type: {ext}"

            # Execute with timeout (30 seconds)
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=self.workspace_root
            )

            output = result.stdout if result.stdout else result.stderr
            success = result.returncode == 0

            logger.info(f"Executed file: {filepath} (return code: {result.returncode})")
            return success, output or f"Execution completed with return code: {result.returncode}"

        except subprocess.TimeoutExpired:
            logger.error(f"Execution timeout: {filepath}")
            return False, "Execution timeout (30s limit)"
        except Exception as e:
            logger.error(f"Error executing file: {str(e)}")
            return False, f"Error executing file: {str(e)}"
