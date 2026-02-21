#!/usr/bin/env python3
"""
Generate images using OpenAI API for WorkFort website.
Usage: python generate_image.py "prompt text" output.png
"""

import sys
import os
import requests
from openai import OpenAI

def generate_image(prompt, output_path, size="1024x1024", model="dall-e-3"):
    """Generate an image using OpenAI API and save it."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    print(f"Generating image with prompt: {prompt}")
    print(f"Model: {model}, Size: {size}")

    response = client.images.generate(
        model=model,
        prompt=prompt,
        size=size,
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url
    print(f"Image generated: {image_url}")

    # Download the image
    print(f"Downloading to: {output_path}")
    img_response = requests.get(image_url)
    img_response.raise_for_status()

    with open(output_path, 'wb') as f:
        f.write(img_response.content)

    print(f"✓ Image saved to {output_path}")
    return output_path

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_image.py 'prompt text' output.png")
        print("Example: python generate_image.py 'cyberpunk AI assistant avatar' avatar.png")
        sys.exit(1)

    prompt = sys.argv[1]
    output = sys.argv[2]

    generate_image(prompt, output)
