#!/bin/bash

# CodeMate AI Backend Startup Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CodeMate AI Backend ===${NC}"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python3 not found. Please install Python 3.11+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python3 found: $(python3 --version)${NC}"

# Check virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install/upgrade dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Install Playwright browsers if not already done
echo -e "${YELLOW}Ensuring Playwright browsers are installed...${NC}"
playwright install chromium

# Start server
echo ""
echo -e "${GREEN}✓ Setup complete. Starting server...${NC}"
echo -e "${BLUE}Server will be available at: ws://localhost:8080${NC}"
echo ""

python main.py
