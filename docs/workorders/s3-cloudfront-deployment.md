# Work Order: S3/CloudFront Website Deployment Infrastructure

**Date:** 2026-02-21
**Requested by:** Marketer
**Assigned to:** DevOps Teammate
**Status:** Pending

## Overview

Deploy workfort.dev website (Docusaurus static site) to S3 with CloudFront CDN. Website repo needs deployment credentials and infrastructure details to configure automated deployment.

## Requirements

### 1. S3 Bucket for Website Hosting

- **Bucket name:** `workfort-website` (or similar naming convention)
- **Region:** `us-east-1` (same as existing infrastructure)
- **Purpose:** Store Docusaurus build output (HTML, CSS, JS, images)
- **Access:** Private (CloudFront OAC only)
- **Configuration:**
  - Block all public access
  - No static website hosting (CloudFront handles routing)
  - Versioning: Optional (recommended for rollback capability)

### 2. CloudFront Distribution for www.workfort.dev

- **Domain:** `www.workfort.dev`
- **Origin:** S3 bucket created above
- **Origin Access:** Origin Access Control (OAC) - modern, more secure than OAI
- **SSL Certificate:** Use existing wildcard `*.workfort.dev` ACM cert (already in us-east-1)
- **Price Class:** `PriceClass_100` (US, Canada, Europe - matches existing apex redirect)
- **Default root object:** `index.html`
- **Custom error responses:**
  - 404 → `/404.html` (Docusaurus generates this)
  - 403 → `/404.html` (treat S3 access denied as 404)

#### CloudFront Function for URL Rewriting

Docusaurus generates `folder/index.html` structure. CloudFront needs URL rewriting:

```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // If URI ends with /, append index.html
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // If URI has no file extension, append /index.html
    else if (!uri.includes('.') && !uri.includes('?')) {
        request.uri += '/index.html';
    }

    return request;
}
```

Attach this function to **Viewer Request** event.

#### Cache Behavior

- **Allowed methods:** GET, HEAD, OPTIONS
- **Cached methods:** GET, HEAD
- **Compress objects:** Yes
- **Viewer protocol:** Redirect HTTP to HTTPS
- **Cache policy:** CachingOptimized (or custom with reasonable TTL)

### 3. Route53 DNS Records

- **A record:** `www.workfort.dev` → CloudFront distribution (alias)
- **AAAA record:** `www.workfort.dev` → CloudFront distribution (alias, IPv6)

### 4. IAM User for Website Deployment

Create dedicated IAM user: `website-deploy` (or similar)

**Scoped permissions (LEAST PRIVILEGE):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::workfort-website"
    },
    {
      "Sid": "S3ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::workfort-website/*"
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::725245223250:distribution/*"
    }
  ]
}
```

**Important:** This user should NOT have:
- IAM permissions
- EC2/Lambda/other AWS service access
- Access to other S3 buckets
- CloudFront distribution modification (only invalidation)

### 5. Terraform Outputs Required

Add to `devops/terraform/outputs.tf`:

```hcl
output "website_s3_bucket" {
  description = "S3 bucket name for website hosting"
  value       = aws_s3_bucket.website.id
}

output "website_cloudfront_id" {
  description = "CloudFront distribution ID for www.workfort.dev"
  value       = aws_cloudfront_distribution.website.id
}

output "website_cloudfront_domain" {
  description = "CloudFront domain name for www.workfort.dev"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_deploy_access_key_id" {
  description = "IAM access key ID for website deployment"
  value       = aws_iam_access_key.website_deploy.id
}

output "website_deploy_secret_key" {
  description = "IAM secret access key for website deployment"
  value       = aws_iam_access_key.website_deploy.secret
  sensitive   = true
}
```

## Deliverables

After infrastructure is deployed, provide to marketer:

1. **S3 bucket name** (from terraform output: `website_s3_bucket`)
2. **CloudFront distribution ID** (from terraform output: `website_cloudfront_id`)
3. **IAM access key ID** (from terraform output: `website_deploy_access_key_id`)
4. **IAM secret access key** (from terraform output: `website_deploy_secret_key`)

Marketer will encrypt these values using SOPS in `website/secrets.yaml` and configure deployment tasks.

## Website Repo Configuration (Already Complete)

The website repo is ready:

- ✅ SOPS/age tooling installed via mise
- ✅ `.sops.yaml` encryption config (needs age public key)
- ✅ `secrets.yaml` placeholder (will be populated with deliverables)
- ✅ `.gitignore` updated to exclude age keys
- ✅ Deployment tasks in `.mise.toml` (deploy, sync, invalidate)
- ✅ `docusaurus.config.ts` updated (removed GitHub Pages config, added trailingSlash: false)

## Deployment Workflow (Post-Infrastructure)

Once infrastructure exists and credentials are stored:

### Local Deployment
```bash
# Set SOPS_AGE_KEY in environment or mise.local.toml
export SOPS_AGE_KEY='AGE-SECRET-KEY-1...'

# Deploy (build + sync + invalidate)
mise run deploy
```

### GitHub Actions Deployment
- Add `SOPS_AGE_KEY` to GitHub repository secrets
- Workflow decrypts `secrets.yaml` at runtime
- Auto-deploy on push to master

## Security Notes

- **secrets.yaml (encrypted)** is COMMITTED to git
- **age-key.txt** is NEVER committed (git-ignored)
- **SOPS_AGE_KEY** stored in GitHub Secrets and developer environments only
- IAM credentials are scoped to ONLY S3 bucket + CloudFront invalidation
- No broader AWS access for deployment user

## Testing Checklist

After deployment:

- [ ] `https://www.workfort.dev` loads correctly
- [ ] `https://www.workfort.dev/blog` shows blog index
- [ ] `https://www.workfort.dev/docs/intro` shows docs
- [ ] HTTPS certificate valid (wildcard cert)
- [ ] HTTP redirects to HTTPS
- [ ] 404 page works (`https://www.workfort.dev/nonexistent`)
- [ ] CloudFront cache invalidation works (updated content appears within ~1 minute)

## References

- Existing infrastructure: `devops/terraform/cloudfront.tf` (apex redirect pattern)
- DevOps SOP: `devops/README.md`
- Existing tooling: `devops/.mise.toml`

## Questions?

Contact marketer or TPM via team channels.
