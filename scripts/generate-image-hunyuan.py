#!/usr/bin/env python3
"""
Generate images using Hunyuan Image 3 via Novita.ai API.

Usage:
    python scripts/generate-image-hunyuan.py --prompt "..." --output static/img/hero/my-image.png
    python scripts/generate-image-hunyuan.py --prompt "..." --size 1024x1024 --output static/img/avatars/marketer.png
"""

import argparse
import os
import sys
import time
from pathlib import Path

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


def submit_generation(api_key: str, prompt: str, size: str = "1024x1024", seed: int = -1) -> str:
    """Submit image generation request and return task_id."""
    url = "https://api.novita.ai/v3/async/hunyuan-image-3"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": prompt,
        "size": size,
    }

    if seed != -1:
        payload["seed"] = seed

    print(f"Submitting generation request...")
    print(f"Prompt: {prompt}")
    print(f"Size: {size}")

    response = requests.post(url, headers=headers, json=payload)

    if not response.ok:
        print(f"API Error: {response.status_code} - {response.text}", file=sys.stderr)

    response.raise_for_status()

    result = response.json()
    task_id = result.get("task_id")

    if not task_id:
        raise ValueError(f"No task_id in response: {result}")

    print(f"✓ Task submitted: {task_id}")
    return task_id


def get_task_result(api_key: str, task_id: str, timeout: int = 300, poll_interval: int = 2):
    """Poll task result endpoint until generation completes."""
    url = f"https://api.novita.ai/v3/async/task-result?task_id={task_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
    }

    start_time = time.time()
    print(f"Polling for results (timeout: {timeout}s)...")

    while True:
        elapsed = time.time() - start_time
        if elapsed > timeout:
            raise TimeoutError(f"Task did not complete within {timeout} seconds")

        response = requests.get(url, headers=headers)

        if not response.ok:
            print(f"API Error: {response.status_code} - {response.text}", file=sys.stderr)

        response.raise_for_status()

        result = response.json()
        task_status = result.get("task", {}).get("status")

        if task_status == "TASK_STATUS_SUCCEED":
            print(f"✓ Generation complete ({elapsed:.1f}s)")
            images = result.get("images", [])
            if not images:
                raise ValueError(f"No images in result: {result}")
            return images[0].get("image_url")

        elif task_status == "TASK_STATUS_FAILED":
            error_msg = result.get("task", {}).get("reason", "Unknown error")
            raise RuntimeError(f"Generation failed: {error_msg}")

        elif task_status in ["TASK_STATUS_QUEUED", "TASK_STATUS_PENDING", "TASK_STATUS_PROCESSING"]:
            print(f"  Status: {task_status} ({elapsed:.1f}s elapsed)")
            time.sleep(poll_interval)

        else:
            raise ValueError(f"Unknown task status: {task_status}")


def download_image(image_url: str, output_path: Path):
    """Download image from URL and save to output path."""
    print(f"Downloading image...")
    response = requests.get(image_url)
    response.raise_for_status()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(response.content)
    print(f"✓ Image saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate images using Hunyuan Image 3")
    parser.add_argument("--prompt", required=True, help="Image generation prompt")
    parser.add_argument(
        "--output",
        required=True,
        help="Output path (e.g., static/img/hero/post-name.png)",
    )
    parser.add_argument(
        "--size",
        default="1024x1024",
        help="Image size (e.g., 1024x1024, 1536x1024, 1024x1536). Range: 256-1536 per dimension.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=-1,
        help="Random seed for reproducibility (-1 for random). Range: -1 to 2147483647",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=300,
        help="Maximum time to wait for generation (seconds). Default: 300",
    )
    parser.add_argument(
        "--no-enhance",
        action="store_true",
        help="Skip Kimi K2.5 prompt enhancement and use the prompt as-is",
    )

    args = parser.parse_args()

    # Get Novita.ai API key from environment
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

    # Enhance prompt using Kimi K2.5 (unless --no-enhance)
    if args.no_enhance:
        print("Skipping prompt enhancement (--no-enhance)")
        enhanced_prompt = args.prompt
    else:
        try:
            enhanced_prompt = enhance_prompt(args.prompt, api_key)
        except Exception as e:
            print(f"Warning: Prompt enhancement failed, using original prompt. {e}", file=sys.stderr)
            enhanced_prompt = args.prompt

    try:
        # Convert size from "1024x1024" to "1024*1024" (Novita API format)
        size_novita = args.size.replace("x", "*")

        # Submit generation request with enhanced prompt
        task_id = submit_generation(api_key, enhanced_prompt, size_novita, args.seed)

        # Poll for results
        image_url = get_task_result(api_key, task_id, args.timeout)
        print(f"Image URL: {image_url}")

        # Download and save
        download_image(image_url, Path(args.output))

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
