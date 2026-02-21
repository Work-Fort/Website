# Work Orders

Work orders for cross-team coordination on infrastructure and deployment.

## Purpose

Work orders serve as the contract between the website team (marketer) and infrastructure team (devops). Each work order:

1. **Specifies requirements** - Clear infrastructure needs and constraints
2. **Defines deliverables** - Exact outputs needed from devops
3. **Acts as documentation** - Single source of truth for what was requested and why
4. **Enables async coordination** - Teams can work independently with clear interfaces

## Process

### 1. Marketer Creates Work Order

- Document infrastructure requirements
- Specify exact deliverables needed
- Include security constraints (least privilege IAM, etc.)
- Reference existing patterns in devops repo

### 2. DevOps Reviews and Implements

- Review work order for completeness
- Create Terraform resources following devops SOP
- Test infrastructure
- Provide deliverables via secure channel (SOPS-encrypted if sensitive)

### 3. Marketer Integrates

- Store deliverables securely (SOPS encryption for credentials)
- Configure deployment workflows
- Test end-to-end
- Document any issues or follow-up needs

## Active Work Orders

- [S3/CloudFront Deployment](./s3-cloudfront-deployment.md) - Status: Pending

## Completed Work Orders

None yet.
