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

    args = parser.parse_args()

    # Get OpenAI API key from environment
    api_key = os.environ.get("OPENAI_API_KEY")
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

    # Initialize OpenAI client
    client = OpenAI(api_key=api_key)

    print(f"Generating image with prompt: {args.prompt}")
    print(f"Size: {args.size}, Quality: {args.quality}, Model: {args.model}")

    try:
        # Generate image
        response = client.images.generate(
            model=args.model,
            prompt=args.prompt,
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
