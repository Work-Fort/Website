#!/usr/bin/env python3
"""
Generate images using OpenAI's DALL-E API for blog posts and avatars.

Usage:
    python scripts/generate-image.py --prompt "A cyberpunk Tron-style..." --output static/img/hero/my-image.png
    python scripts/generate-image.py --prompt "..." --size 1024x1024 --quality hd --output static/img/avatars/marketer.png
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai", file=sys.stderr)
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Error: requests package not installed. Run: pip install requests", file=sys.stderr)
    sys.exit(1)

# Import prompt enhancement utility
try:
    from enhance_prompt import enhance_prompt
except ImportError:
    print("Error: enhance_prompt module not found", file=sys.stderr)
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generate images using OpenAI DALL-E")
    parser.add_argument("--prompt", required=True, help="Image generation prompt")
    parser.add_argument(
        "--output",
        required=True,
        help="Output path (e.g., static/img/hero/post-name.png)",
    )
    parser.add_argument(
        "--size",
        default="1792x1024",
        choices=["1024x1024", "1792x1024", "1024x1792"],
        help="Image size (default: 1792x1024 for hero images)",
    )
    parser.add_argument(
        "--quality",
        default="standard",
        choices=["standard", "hd"],
        help="Image quality (default: standard)",
    )
    parser.add_argument(
        "--model",
        default="dall-e-3",
        choices=["dall-e-2", "dall-e-3"],
        help="DALL-E model version (default: dall-e-3)",
    )
    parser.add_argument(
        "--no-enhance",
        action="store_true",
        help="Skip Kimi K2.5 prompt enhancement and use the prompt as-is",
    )

    args = parser.parse_args()

    # Get API keys from environment
    api_key = os.environ.get("OPENAI_API_KEY")
    novita_api_key = os.environ.get("NOVITA_API_KEY")

    if not api_key:
        print(
            "Error: OPENAI_API_KEY environment variable not set",
            file=sys.stderr,
        )
        print(
            "Run: export OPENAI_API_KEY=$(sops -d secrets.yaml | yq .openai_api_key)",
            file=sys.stderr,
        )
        sys.exit(1)

    if not novita_api_key:
        print(
            "Error: NOVITA_API_KEY environment variable not set",
            file=sys.stderr,
        )
        print(
            "Run: export NOVITA_API_KEY=$(sops -d secrets.yaml | yq .novita_api_key)",
            file=sys.stderr,
        )
        sys.exit(1)

    # Enhance prompt using Kimi K2.5 (unless --no-enhance)
    if args.no_enhance:
        print("Skipping prompt enhancement (--no-enhance)")
        enhanced_prompt = args.prompt
    else:
        try:
            enhanced_prompt = enhance_prompt(args.prompt, novita_api_key)
        except Exception as e:
            print(f"Warning: Prompt enhancement failed, using original prompt. {e}", file=sys.stderr)
            enhanced_prompt = args.prompt

    # Initialize OpenAI client
    client = OpenAI(api_key=api_key)

    print(f"Generating image with enhanced prompt")
    print(f"Size: {args.size}, Quality: {args.quality}, Model: {args.model}")

    try:
        # Generate image with enhanced prompt
        response = client.images.generate(
            model=args.model,
            prompt=enhanced_prompt,
            size=args.size,
            quality=args.quality,
            n=1,
        )

        # Get image URL
        image_url = response.data[0].url
        print(f"Image generated: {image_url}")

        # Download image
        print(f"Downloading to {args.output}...")
        image_response = requests.get(image_url)
        image_response.raise_for_status()

        # Ensure output directory exists
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Save image
        output_path.write_bytes(image_response.content)
        print(f"✓ Image saved to {args.output}")

        # Print revised prompt if available
        if hasattr(response.data[0], "revised_prompt") and response.data[0].revised_prompt:
            print(f"\nRevised prompt: {response.data[0].revised_prompt}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
