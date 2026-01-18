"""Configuration for the Political Spectrum LLM Council."""
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council defined as a map of Model -> Political Persona
# SPEED OPTIMIZATION: Using 'Flash/Haiku' models for Stage 1 Experts.
# These models respond in <5 seconds while maintaining high instruction following.
COUNCIL_CONFIG = {
    "anthropic/claude-3-haiku": "Progressive/Left",
    "meta-llama/llama-3.1-8b-instruct": "Traditionalist/Right",
    "x-ai/grok-4-mini": "Libertarian/Lean-Right", # Mini version for speed
    "google/gemini-flash-1.5": "Centrist/Fact-Checker"
}

COUNCIL_MODELS = list(COUNCIL_CONFIG.keys())

# THE CHAIRMAN: Use the strongest frontier model here for the final summary.
# Claude 4.5/GPT-5 is perfect here because it only runs ONCE at the end.
CHAIRMAN_MODEL = "anthropic/claude-sonnet-4.5" 

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DATA_DIR = "data/conversations"

EMBEDDING_MODEL = "openai/text-embedding-3-small"

# REFINED RUBRIC: Added a constraint for brevity at the source.
POLITICAL_RUBRIC = """
Analyze the content based on these categories:
- LEFT: Systemic inequality, social justice, environment.
- LEAN LEFT: Critical of corporations, institutional trust.
- CENTER: Fact-focused, balanced, minimal adjectives.
- LEAN RIGHT: Individual liberty, free markets, traditional values.
- RIGHT: National sovereignty, tradition, anti-big government.

STRICT INSTRUCTION: Keep your expert analysis under 150 words. Focus on core evidence.
"""