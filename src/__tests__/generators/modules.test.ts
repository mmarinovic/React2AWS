import { describe, it, expect } from 'bun:test';
import { generateLambdaModule, generateDynamoDBModule, generateS3Module, generateRDSModule } from '@/lib/generators/modules';

describe('Lambda Module Security', () => {
  const { mainTf, variablesTf } = generateLambdaModule();

  it('defaults function URL auth to AWS_IAM', () => {
    expect(variablesTf).toContain('default     = "AWS_IAM"');
  });

  it('validates authorization type', () => {
    expect(variablesTf).toContain('contains(["NONE", "AWS_IAM"], var.function_url_auth_type)');
  });

  it('has configurable CORS settings', () => {
    expect(variablesTf).toContain('variable "function_url_cors"');
    expect(mainTf).toContain('var.function_url_cors.allow_origins');
  });

  it('warns about function URL being publicly accessible', () => {
    expect(variablesTf).toContain('WARNING: publicly accessible endpoint');
  });

  it('uses restrictive CORS defaults', () => {
    expect(variablesTf).toContain('allow_origins     = optional(list(string), [])');
    expect(variablesTf).toContain('allow_credentials = optional(bool, false)');
  });
});

describe('DynamoDB Module Security', () => {
  const { mainTf } = generateDynamoDBModule();

  it('has commented prevent_destroy guidance for production', () => {
    expect(mainTf).toContain('IMPORTANT: For production');
    expect(mainTf).toContain('prevent_destroy = true');
  });

  it('enables server-side encryption', () => {
    expect(mainTf).toContain('server_side_encryption');
    expect(mainTf).toContain('enabled = true');
  });

  it('enables point-in-time recovery for production', () => {
    expect(mainTf).toContain('var.environment == "production" || var.enable_point_in_time_recovery');
  });
});

describe('S3 Module Security', () => {
  const { mainTf } = generateS3Module();

  it('blocks all public access by default', () => {
    expect(mainTf).toContain('block_public_acls       = true');
    expect(mainTf).toContain('block_public_policy     = true');
    expect(mainTf).toContain('ignore_public_acls      = true');
    expect(mainTf).toContain('restrict_public_buckets = true');
  });

  it('enables server-side encryption', () => {
    expect(mainTf).toContain('aws_s3_bucket_server_side_encryption_configuration');
    expect(mainTf).toContain('apply_server_side_encryption_by_default');
  });
});

describe('RDS Module Security', () => {
  const { mainTf } = generateRDSModule();

  it('enables encryption at rest', () => {
    expect(mainTf).toContain('storage_encrypted     = true');
  });

  it('enables deletion protection for production', () => {
    expect(mainTf).toContain('deletion_protection         = var.environment == "production"');
  });

  it('uses Secrets Manager for credentials', () => {
    expect(mainTf).toContain('aws_secretsmanager_secret');
    expect(mainTf).toContain('aws_secretsmanager_secret_version');
  });

  it('generates random password', () => {
    expect(mainTf).toContain('random_password');
    expect(mainTf).toContain('length  = 32');
  });

  it('skips final snapshot only for non-production', () => {
    expect(mainTf).toContain('skip_final_snapshot         = var.environment != "production"');
  });
});
