#!/usr/bin/env python3
"""
Generate images using Google Gemini 2.5 Flash Image (nano-banana) API.

Usage:
    python scripts/generate-image-nanobana.py --prompt "..." --output static/img/hero/my-image.png
    python scripts/generate-image-nanobana.py --prompt "..." --size 1024x1024 --output static/img/avatars/marketer.png
"""

import argparse
import os
import sys
from pathlib import Path

try:
    import google.genai as genai
except ImportError:
    print("Error: google-genai package not installed. Run: pip install google-genai", file=sys.stderr)
    sys.exit(1)

# Import prompt enhancement utility
try:
    from enhance_prompt import enhance_prompt
except ImportError:
    print("Error: enhance_prompt module not found", file=sys.stderr)
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generate images using Google Gemini 2.5 Flash Image")
    parser.add_argument("--prompt", required=True, help="Image generation prompt")
    parser.add_argument(
        "--output",
        required=True,
        help="Output path (e.g., static/img/hero/post-name.png)",
    )
    parser.add_argument(
        "--size",
        default="1792x1024",
        help="Image size (e.g., 1024x1024, 1792x1024). Supported sizes vary by model.",
    )

    args = parser.parse_args()

    # Get API keys from environment
    api_key = os.environ.get("GEMINI_API_KEY")
    novita_api_key = os.environ.get("NOVITA_API_KEY")

    if not api_key:
        print(
            "Error: GEMINI_API_KEY environment variable not set",
            file=sys.stderr,
        )
        print(
            "Run: export GEMINI_API_KEY=$(sops -d secrets.yaml | yq .gemini_api_key)",
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

    # Enhance prompt using Kimi K2.5
    try:
        enhanced_prompt = enhance_prompt(args.prompt, novita_api_key)
    except Exception as e:
        print(f"Warning: Prompt enhancement failed, using original prompt. {e}", file=sys.stderr)
        enhanced_prompt = args.prompt

    # Configure the client
    client = genai.Client(api_key=api_key)

    print(f"Generating image with enhanced prompt")
    print(f"Size: {args.size}")
    print(f"Model: gemini-2.5-flash-image")

    try:
        # Generate image using Gemini with enhanced prompt
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[enhanced_prompt],
        )

        # Ensure output directory exists
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Extract and save image from response
        image_saved = False
        for part in response.parts:
            if part.text is not None:
                print(f"Model response: {part.text}")
            elif part.inline_data is not None:
                print(f"Saving image to {args.output}...")
                image = part.as_image()
                image.save(str(output_path))
                image_saved = True
                break

        if not image_saved:
            raise ValueError("No image was generated in the response")

        print(f"✓ Image saved to {args.output}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
