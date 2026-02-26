import logging
import asyncio
from typing import Optional, Dict, List
from enum import Enum

logger = logging.getLogger(__name__)


class BrowserTab(Enum):
    """Available browser tabs"""
    GEMINI = "Gemini"
    CLAUDE = "Claude"
    CHATGPT = "ChatGPT"


class BrowserManager:
    """
    Manage Playwright browser instance with three tabs
    (Gemini, Claude, ChatGPT) for AI interactions
    """

    def __init__(self):
        """Initialize browser manager"""
        self.browser = None
        self.context = None
        self.pages: Dict[BrowserTab, any] = {}
        self.is_running = False

    async def initialize(self):
        """
        Initialize browser and create tabs

        Note: Playwright requires installation:
        playwright install
        """
        try:
            from playwright.async_api import async_playwright

            # Start browser context
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(headless=True)
            self.context = await self.browser.new_context()

            # Create tabs for each AI service
            urls = {
                BrowserTab.GEMINI: "https://gemini.google.com",
                BrowserTab.CLAUDE: "https://claude.ai",
                BrowserTab.CHATGPT: "https://chat.openai.com",
            }

            for tab, url in urls.items():
                try:
                    page = await self.context.new_page()
                    # Don't wait for full load, just navigate
                    page.set_default_timeout(10000)
                    await page.goto(url, wait_until="domcontentloaded")
                    self.pages[tab] = page
                    logger.info(f"Initialized {tab.value} tab")
                except Exception as e:
                    logger.warning(f"Failed to initialize {tab.value} tab: {str(e)}")
                    # Continue even if one tab fails

            self.is_running = True
            logger.info("Browser manager initialized successfully")
            return True, "Browser initialized with AI tabs"
        except Exception as e:
            logger.error(f"Failed to initialize browser: {str(e)}")
            return False, f"Browser initialization failed: {str(e)}"

    async def get_page(self, assistant: str):
        """
        Get Playwright page for specified assistant

        Args:
            assistant: Assistant name (Gemini, Claude, ChatGPT)

        Returns:
            Playwright page object or None
        """
        try:
            tab = BrowserTab[assistant.upper()]
            return self.pages.get(tab)
        except (KeyError, AttributeError):
            logger.warning(f"Unknown assistant: {assistant}")
            return None

    async def interact_with_ai(self, assistant: str, message: str) -> tuple[bool, str]:
        """
        Interact with AI service (placeholder)

        In production, this would:
        1. Find the input field on the page
        2. Type the message
        3. Submit
        4. Wait for response
        5. Extract response text

        Args:
            assistant: Assistant name
            message: Message to send

        Returns:
            tuple: (success, response)
        """
        page = await self.get_page(assistant)
        if not page:
            return False, f"No page available for {assistant}"

        try:
            # Placeholder: actual implementation would interact with the page
            logger.info(f"Would interact with {assistant}: {message}")
            return True, f"Interaction prepared for {assistant}"
        except Exception as e:
            logger.error(f"Error interacting with {assistant}: {str(e)}")
            return False, f"Interaction failed: {str(e)}"

    async def close(self):
        """Close browser and cleanup"""
        try:
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
            self.is_running = False
            logger.info("Browser closed")
        except Exception as e:
            logger.error(f"Error closing browser: {str(e)}")

    async def health_check(self) -> tuple[bool, str]:
        """Check if browser and pages are running"""
        if not self.is_running:
            return False, "Browser not initialized"

        active_pages = []
        for tab, page in self.pages.items():
            if page and not page.is_closed():
                active_pages.append(tab.value)

        if not active_pages:
            return False, "No active browser pages"

        return True, f"Active tabs: {', '.join(active_pages)}"
