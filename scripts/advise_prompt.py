#!/usr/bin/env python3
"""
Get prompt advice using Kimi K2.5 via Novita.ai API.

This script takes a prompt idea and provides feedback on how to use better
language to visualize the intent for image generation.

Usage:
    python scripts/advise_prompt.py --prompt "A futuristic city"
    mise run advise-prompt -- --prompt "A warrior in battle"
"""

import argparse
import os
import sys

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai", file=sys.stderr)
    sys.exit(1)


def advise_prompt(prompt_idea: str, api_key: str) -> str:
    """
    Get advice on improving an image generation prompt using Kimi K2.5.

    Args:
        prompt_idea: The user's initial prompt idea
        api_key: Novita.ai API key

    Returns:
        Advice on how to improve the prompt

    Raises:
        RuntimeError: If API call fails
    """
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.novita.ai/openai"
    )

    system_prompt = """You are an expert image generation prompt advisor. Your task is to analyze a user's prompt idea and provide constructive feedback on how they can use better, more descriptive language to visualize their intent.

Focus your advice on:
- More vivid and specific descriptive language
- Visual details that would help an AI image generator
- Composition and framing suggestions
- Lighting and atmosphere descriptions
- Technical photography terms that clarify the vision
- Style references if applicable

Provide your advice in a conversational, helpful tone. Structure your response as:
1. What works well in their current idea
2. Specific suggestions for improvement with examples
3. An example of how the revised prompt could read

Keep your advice practical and actionable. Be encouraging while being specific."""

    print(f"🔍 Getting prompt advice from Kimi K2.5...")
    print(f"Your prompt idea: {prompt_idea}")
    print()

    try:
        response = client.chat.completions.create(
            model="moonshotai/kimi-k2.5",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please provide advice on this image generation prompt:\n\n{prompt_idea}"}
            ],
            max_tokens=1024,
            temperature=0.7
        )

        advice = response.choices[0].message.content.strip()
        return advice

    except Exception as e:
        raise RuntimeError(f"Prompt advice request failed: {e}")


def main():
    """CLI for getting prompt advice."""
    parser = argparse.ArgumentParser(description="Get prompt advice using Kimi K2.5")
    parser.add_argument("--prompt", required=True, help="Your prompt idea to get advice on")

    args = parser.parse_args()

    # Get API key from environment
    api_key = os.environ.get("NOVITA_API_KEY")
    if not api_key:
        print(
            "Error: NOVITA_API_KEY environment variable not set",
            file=sys.stderr,
        )
        print(
            "Run: export NOVITA_API_KEY=$(sops -d secrets.yaml | yq .novita_api_key)",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        advice = advise_prompt(args.prompt, api_key)

        print("=" * 80)
        print("PROMPT ADVICE:")
        print("=" * 80)
        print(advice)
        print()

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
