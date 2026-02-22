# Image Generation Guide

Guide for generating images for the WorkFort website using DALL-E 3.

## Setup

Image generation uses OpenAI's DALL-E 3 API with credentials stored in encrypted `secrets.yaml`.

### Commands

```bash
# Install Python dependencies
mise run python_deps

# Generate hero image (1792x1024, standard quality)
mise run image_hero -- --prompt "..." --output "static/img/hero/filename.png"

# Generate avatar (1024x1024, HD quality)
mise run image_avatar -- --prompt "..." --output "static/img/avatars/filename.png"

# Generate featured/social image (1024x1024, standard quality)
mise run image_featured -- --prompt "..." --output "static/img/featured/filename.png"
```

### Cost

- Standard quality: ~$0.04 per image
- HD quality: ~$0.08 per image

Generate multiple variations and compare before committing.

## DALL-E 3 Prompting Best Practices

### 1. Use "Photo of" Not "Photorealistic"

❌ **Wrong:** "Photorealistic image of..."
✅ **Right:** "Photo of..."

The word "photorealistic" is interpreted as an art style, not actual photography.

### 2. Be Specific and Detailed

The more specific your prompt, the better the results. Include:
- **Setting:** Where is this? (studio, datacenter, outdoor)
- **Lighting:** What kind of lighting? (low-key, three-point, neon)
- **Mood:** What feeling? (moody, technical, futuristic)
- **Camera details:** Shot on what? (Sony F35, 35mm film)
- **Technical specs:** Aperture, ISO, focus (f/2.8, sharp focus)

### 3. Tron Legacy Aesthetic

WorkFort's visual identity is based on Tron Legacy cinematography. Key elements:

**Lighting:**
- **Low-key lighting** - Deep shadows, high contrast
- **Three-point lighting** - Professional studio setup
- **Cool fluorescents and LEDs** - Otherworldly atmosphere
- **Neon cyan/blue glows** - Soft glowing light strips

**Color palette:**
- **Cyan/blue (#00f0ff)** - Primary brand color, glowing elements
- **Magenta (#bf00ff)** - Accent color (use sparingly)
- **Black backgrounds** - Pure black, deep shadows
- **Subtle grid patterns** - Visible in darkness

**Composition:**
- **High contrast** - Brightest highlights vs darkest shadows
- **Sharp focus** - Cinematic clarity
- **Minimal ornament** - Function over decoration
- **Angular geometry** - No rounded corners

### 4. Photography-Specific Details

**Camera references:**
- "Shot on Sony F35 camera" (Tron Legacy used this)
- "35mm film photography"
- "Cinematic photography"

**Lighting specs:**
- "Three-point lighting setup"
- "Studio lighting"
- "Low-key lighting with deep shadows"
- "Cool fluorescent LED lighting"

**Technical details:**
- "Sharp focus"
- "High contrast"
- "f/2.8 aperture"
- "ISO 800"

### 5. Iterative Refinement

Generate multiple variations:
1. Start with broad description
2. Review results
3. Refine prompt with more specific details
4. Save variations with `-1`, `-2`, `-3` suffixes

```bash
# First attempt
mise run image_avatar -- --prompt "..." --output "static/img/avatars/subject-1.png"

# Second attempt (refined)
mise run image_avatar -- --prompt "..." --output "static/img/avatars/subject-2.png"

# Third attempt (final refinement)
mise run image_avatar -- --prompt "..." --output "static/img/avatars/subject-3.png"
```

## Example Prompts

### Avatar (Photorealistic Tron Legacy Style)

```
Photo of a person in a dark studio with Tron Legacy cinematography. Low-key lighting with deep shadows and high contrast. Soft glowing neon cyan light strips on clothing and environment. Black background with subtle grid pattern visible in darkness. Cool fluorescent LED lighting creating otherworldly atmosphere. Three-point lighting setup. Cinematic photography, shot on Sony F35 camera. Sharp focus, moody, futuristic but realistic.
```

### Hero Image (Datacenter/Infrastructure)

```
Photo of a futuristic datacenter corridor with Tron Legacy aesthetic. Endless perspective down a dark hallway with server racks on both sides. Glowing cyan LED strips on rack edges. Black floor with subtle grid pattern. Low-key lighting, deep shadows, high contrast. Cool fluorescent lighting creating otherworldly atmosphere. Neon reflections like a disco ball. Shot on Sony F35 camera. Cinematic photography, sharp focus, moody and technical.
```

### Featured Image (Technical/Abstract)

```
Photo of glowing AI chip arrays in a dark environment. Close-up technical photography. Neon cyan light emanating from circuit patterns. Black background with angular geometric shapes. High contrast, sharp focus. Studio lighting with cyan LED accents. Futuristic but realistic. Shot on macro lens, f/2.8, cinematic.
```

## Workflow

1. **Draft prompt** - Start with basic description
2. **Add Tron elements** - Low-key lighting, neon cyan, high contrast
3. **Add camera details** - "Photo of", camera model, technical specs
4. **Generate first variant** - Save as `filename-1.png`
5. **Review and refine** - What's missing? Too bright? Too dark?
6. **Generate more variants** - Save as `filename-2.png`, `filename-3.png`
7. **Select best** - Compare all variants
8. **Commit chosen image** - Use final version in content

## Avoiding Common Mistakes

❌ **Don't say:** "cartoon style", "illustration", "anime", "3D render"
✅ **Do say:** "Photo of", "cinematic photography", "studio photography"

❌ **Don't say:** "photorealistic", "hyperrealistic"
✅ **Do say:** "Photo of", specific camera/lens details

❌ **Don't say:** "bright", "colorful", "vibrant"
✅ **Do say:** "low-key lighting", "deep shadows", "high contrast"

❌ **Don't say:** "rounded corners", "soft edges"
✅ **Do say:** "angular geometry", "sharp edges", "clipped corners"

## References

**DALL-E 3 Best Practices:**
- [DALL-E 3 Prompt Guide - Robot Builders](https://robotbuilders.net/dall%C2%B7e-3-prompt-guide-best-practices-for-hyper-realistic-images/)
- [DALL-E 3 Prompting Tips - OpenAI Community](https://community.openai.com/t/collection-of-dall-e-3-prompting-tips-issues-and-bugs/889278)
- [Photorealism with DALL-E - Medium](https://medium.com/merzazine/prompt-design-for-dall-e-photorealism-emulating-reality-6f478df6f186)

**Tron Legacy Cinematography:**
- [Claudio Miranda ASC - Tron Legacy](https://britishcinematographer.co.uk/claudio-miranda-asc-tron-legacy/)
- [Lighting in Tron Legacy](https://hombeno.wordpress.com/2014/12/12/a-film-course-review-on-lighting-tron-legacy/)
- [Tron Legacy Design Team Interview](https://www.denofgeek.com/movies/tron-legacy-design-team-interview-light-cycles-suits-architecture-and-more/)

**Brand Guide:**
- [WorkFort Brand Guide](/brand) - Colors, typography, aesthetic guidelines
