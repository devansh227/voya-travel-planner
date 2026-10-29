"""Test setup.

app.services.gemini_service refuses to import without GEMINI_* variables.
The tests mock Gemini, so harmless placeholders are enough. setdefault never
overrides a real value from your shell or .env.
"""

import os

os.environ.setdefault("GEMINI_API_KEY", "test-key-not-used")
os.environ.setdefault("GEMINI_MODEL", "test-model-not-used")
