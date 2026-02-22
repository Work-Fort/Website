#!/usr/bin/env python3
"""
Enhance image generation prompts using Kimi K2.5 via Novita.ai API.

This module provides prompt enhancement for all image generation scripts.
"""

import os
import sys

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai", file=sys.stderr)
    sys.exit(1)


def enhance_prompt(original_prompt: str, api_key: str) -> str:
    """
    Enhance an image generation prompt using Kimi K2.5.

    Args:
        original_prompt: The original user prompt
        api_key: Novita.ai API key

    Returns:
        Enhanced prompt optimized for image generation

    Raises:
        RuntimeError: If API call fails
    """
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.novita.ai/openai"
    )

    system_prompt = """You are an expert at enhancing image generation prompts. Your task is to take a user's prompt and enhance it with specific technical details that will produce better images while maintaining the original intent.

Add details about:
- Photography/camera specifics (camera models, lenses, aperture, ISO)
- Lighting setup (low-key, three-point, studio lighting)
- Composition and framing
- Technical quality (sharp focus, high contrast)
- Mood and atmosphere

Keep the enhanced prompt concise (under 200 words) and focused. Return ONLY the enhanced prompt, no explanations."""

    print(f"🔄 Enhancing prompt with Kimi K2.5...")

    try:
        response = client.chat.completions.create(
            model="moonshotai/kimi-k2.5",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Enhance this image generation prompt:\n\n{original_prompt}"}
            ],
            max_tokens=512,
            temperature=0.7
        )

        enhanced = response.choices[0].message.content.strip()

        print(f"✓ Original: {original_prompt[:80]}...")
        print(f"✓ Enhanced: {enhanced[:80]}...")

        return enhanced

    except Exception as e:
        raise RuntimeError(f"Prompt enhancement failed: {e}")


def main():
    """CLI for testing prompt enhancement."""
    if len(sys.argv) < 2:
        print("Usage: python enhance_prompt.py 'your prompt here'", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("NOVITA_API_KEY")
    if not api_key:
        print("Error: NOVITA_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    prompt = sys.argv[1]

    try:
        enhanced = enhance_prompt(prompt, api_key)
        print("\n" + "="*80)
        print("ENHANCED PROMPT:")
        print("="*80)
        print(enhanced)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
