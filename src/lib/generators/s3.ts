import { S3Resource } from '@/types/aws';
import { sanitizeName } from '@/lib/utils/terraform';

export function generateS3(resource: S3Resource): string {
  const {
    name,
    acl = 'private',
    versioned = false,
    encrypted = false,
  } = resource;

  const sanitizedName = sanitizeName(name);
  const bucketName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  const versioningConfig = versioned ? `
resource "aws_s3_bucket_versioning" "${sanitizedName}_versioning" {
  bucket = aws_s3_bucket.${sanitizedName}.id

  versioning_configuration {
    status = "Enabled"
  }
}` : '';

  const encryptionConfig = encrypted ? `
resource "aws_s3_bucket_server_side_encryption_configuration" "${sanitizedName}_encryption" {
  bucket = aws_s3_bucket.${sanitizedName}.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.${sanitizedName}_key.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_kms_key" "${sanitizedName}_key" {
  description             = "KMS key for ${name} S3 bucket encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "\${var.project_name}-${name}-s3-key"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

resource "aws_kms_alias" "${sanitizedName}_key_alias" {
  name          = "alias/\${var.project_name}-${name}-s3"
  target_key_id = aws_kms_key.${sanitizedName}_key.key_id
}` : `
resource "aws_s3_bucket_server_side_encryption_configuration" "${sanitizedName}_encryption" {
  bucket = aws_s3_bucket.${sanitizedName}.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}`;

  const publicAccessBlock = acl === 'private' ? `
resource "aws_s3_bucket_public_access_block" "${sanitizedName}_public_access" {
  bucket = aws_s3_bucket.${sanitizedName}.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}` : `
resource "aws_s3_bucket_public_access_block" "${sanitizedName}_public_access" {
  bucket = aws_s3_bucket.${sanitizedName}.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}`;

  return `# S3 Bucket: ${name}
resource "aws_s3_bucket" "${sanitizedName}" {
  bucket = "\${var.project_name}-${bucketName}-\${var.environment}"

  tags = {
    Name        = "\${var.project_name}-${name}"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}
${versioningConfig}${encryptionConfig}${publicAccessBlock}

# Lifecycle rules for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "${sanitizedName}_lifecycle" {
  bucket = aws_s3_bucket.${sanitizedName}.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 180
      storage_class = "GLACIER"
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}`;
}

export function generateS3Outputs(resource: S3Resource): string {
  const sanitizedName = sanitizeName(resource.name);

  return `output "${sanitizedName}_bucket_name" {
  description = "S3 bucket name for ${resource.name}"
  value       = aws_s3_bucket.${sanitizedName}.id
}

output "${sanitizedName}_bucket_arn" {
  description = "S3 bucket ARN for ${resource.name}"
  value       = aws_s3_bucket.${sanitizedName}.arn
}

output "${sanitizedName}_bucket_domain_name" {
  description = "S3 bucket domain name for ${resource.name}"
  value       = aws_s3_bucket.${sanitizedName}.bucket_domain_name
}`;
}
