import { AWSResource, RootFiles } from '@/types/aws';
import { sanitizeName } from '@/lib/utils/terraform';

interface ResourceInfo {
  type: string;
  name: string;
  sanitizedName: string;
  resource: AWSResource;
  vpcName?: string;
}

function flattenResources(resources: AWSResource[], vpcName?: string): ResourceInfo[] {
  const result: ResourceInfo[] = [];

  for (const resource of resources) {
    if (resource.type === 'Infrastructure') {
      if (resource.children) {
        result.push(...flattenResources(resource.children, vpcName));
      }
    } else if (resource.type === 'VPC') {
      result.push({
        type: resource.type,
        name: resource.name,
        sanitizedName: sanitizeName(resource.name),
        resource,
        vpcName: undefined,
      });
      if (resource.children) {
        result.push(...flattenResources(resource.children, resource.name));
      }
    } else {
      result.push({
        type: resource.type,
        name: resource.name,
        sanitizedName: sanitizeName(resource.name),
        resource,
        vpcName,
      });
    }
  }

  return result;
}

function generateModuleCall(info: ResourceInfo, allResources: ResourceInfo[]): string {
  const { type, name, sanitizedName, resource, vpcName } = info;
  const vpcSanitized = vpcName ? sanitizeName(vpcName) : undefined;

  switch (type) {
    case 'VPC': {
      const vpc = resource as AWSResource & { cidr?: string; enableNatGateway?: boolean; singleNatGateway?: boolean };
      return `module "vpc_${sanitizedName}" {
  source = "./modules/vpc"

  name         = "${name}"
  environment  = var.environment
  project_name = var.project_name
  cidr         = var.vpc_cidr

  enable_nat_gateway = ${vpc.enableNatGateway ?? true}
  single_nat_gateway = local.is_production ? false : ${vpc.singleNatGateway ?? true}
}`;
    }

    case 'Lambda': {
      const lambda = resource as AWSResource & { runtime?: string; memory?: number; timeout?: number };
      const vpcConfig = vpcSanitized ? `
  vpc_config = {
    vpc_id     = module.vpc_${vpcSanitized}.vpc_id
    subnet_ids = module.vpc_${vpcSanitized}.private_subnet_ids
  }` : '';

      const s3Buckets = allResources.filter(r => r.type === 'S3');
      const dynamoTables = allResources.filter(r => r.type === 'DynamoDB');
      const rdsInstances = allResources.filter(r => r.type === 'RDS');

      const s3Access = s3Buckets.length > 0 ? `
  s3_bucket_arns = [${s3Buckets.map(s => `module.s3_${s.sanitizedName}.bucket_arn`).join(', ')}]` : '';

      const dynamoAccess = dynamoTables.length > 0 ? `
  dynamodb_table_arns = [${dynamoTables.map(d => `module.dynamodb_${d.sanitizedName}.table_arn`).join(', ')}]` : '';

      const secretsAccess = rdsInstances.length > 0 ? `
  secrets_arns = [${rdsInstances.map(r => `module.rds_${r.sanitizedName}.db_credentials_secret_arn`).join(', ')}]` : '';

      return `module "lambda_${sanitizedName}" {
  source = "./modules/lambda"

  name         = "${name}"
  environment  = var.environment
  project_name = var.project_name

  runtime     = "${lambda.runtime || 'nodejs20.x'}"
  memory_size = ${lambda.memory || 128}
  timeout     = ${lambda.timeout || 30}${vpcConfig}${s3Access}${dynamoAccess}${secretsAccess}
}`;
    }

    case 'S3': {
      const s3 = resource as AWSResource & { versioned?: boolean };
      return `module "s3_${sanitizedName}" {
  source = "./modules/s3"

  name         = "${name}"
  environment  = var.environment
  project_name = var.project_name

  versioning = ${s3.versioned ?? true}
}`;
    }

    case 'DynamoDB': {
      const dynamo = resource as AWSResource & { billingMode?: string };
      return `module "dynamodb_${sanitizedName}" {
  source = "./modules/dynamodb"

  name         = "${name}"
  environment  = var.environment
  project_name = var.project_name

  billing_mode = "${dynamo.billingMode || 'PAY_PER_REQUEST'}"

  enable_point_in_time_recovery = local.is_production
}`;
    }

    case 'RDS': {
      const rds = resource as AWSResource & {
        engine?: string;
        instanceClass?: string;
        storage?: number;
        maxStorage?: number;
        multiAz?: boolean;
        backupRetention?: number;
      };

      return `module "rds_${sanitizedName}" {
  source = "./modules/rds"

  name         = "${name}"
  environment  = var.environment
  project_name = var.project_name

  vpc_id     = module.vpc_${vpcSanitized || 'main'}.vpc_id
  subnet_ids = module.vpc_${vpcSanitized || 'main'}.private_subnet_ids

  engine         = "${rds.engine || 'postgres'}"
  instance_class = local.is_production ? "${rds.instanceClass || 'db.t4g.small'}" : "db.t4g.micro"

  allocated_storage     = ${rds.storage || 20}
  max_allocated_storage = ${rds.maxStorage || 100}

  multi_az                = local.is_production || ${rds.multiAz || false}
  backup_retention_period = local.is_production ? ${Math.max(rds.backupRetention || 7, 7)} : ${rds.backupRetention || 1}
  deletion_protection     = local.is_production

  monitoring_interval          = local.is_production ? 60 : 0
  performance_insights_enabled = local.is_production

  allowed_cidr_blocks = [module.vpc_${vpcSanitized || 'main'}.vpc_cidr_block]
}`;
    }

    case 'Fargate': {
      const fargate = resource as AWSResource & {
        cpu?: number;
        memory?: number;
        desiredCount?: number;
        port?: number;
      };

      return `module "fargate_${sanitizedName}" {
  source = "./modules/fargate"

  name         = "${name}"
  environment  = var.environment
  project_name = var.project_name
  aws_region   = var.aws_region

  vpc_id     = module.vpc_${vpcSanitized || 'main'}.vpc_id
  subnet_ids = module.vpc_${vpcSanitized || 'main'}.private_subnet_ids

  container_image = var.${sanitizedName}_container_image
  container_port  = ${fargate.port || 80}

  cpu    = ${fargate.cpu || 256}
  memory = ${fargate.memory || 512}

  desired_count            = ${fargate.desiredCount || 1}
  enable_autoscaling       = local.is_production
  autoscaling_max_capacity = local.is_production ? ${(fargate.desiredCount || 1) * 5} : ${fargate.desiredCount || 1}
}`;
    }

    default:
      return `# ${type} ${name} - module not implemented`;
  }
}

function generateMainTf(resources: ResourceInfo[]): string {
  const moduleCalls = resources.map(r => generateModuleCall(r, resources)).join('\n\n');

  return `# =============================================================================
# Generated by React2AWS
# =============================================================================

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
      Generator   = "React2AWS"
    }
  }
}

provider "random" {}

# =============================================================================
# Local Values
# =============================================================================

locals {
  is_production = var.environment == "production"
}

# =============================================================================
# Module Instances
# =============================================================================

${moduleCalls}
`;
}

function generateVariablesTf(resources: ResourceInfo[]): string {
  const fargateResources = resources.filter(r => r.type === 'Fargate');

  const fargateVars = fargateResources.map(f => `
variable "${f.sanitizedName}_container_image" {
  description = "Container image for ${f.name} Fargate service"
  type        = string
}`).join('\n');

  return `# =============================================================================
# Variables
# Generated by React2AWS
# =============================================================================

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile"
  type        = string
  default     = "default"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "development"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "project_name" {
  description = "Project name used as prefix for resources"
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,20}$", var.project_name))
    error_message = "Project name must be lowercase, start with a letter, max 21 chars."
  }
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}
${fargateVars}
`;
}

function generateOutputsTf(resources: ResourceInfo[]): string {
  const outputs: string[] = [];

  for (const r of resources) {
    switch (r.type) {
      case 'VPC':
        outputs.push(`output "vpc_${r.sanitizedName}_id" {
  description = "VPC ID for ${r.name}"
  value       = module.vpc_${r.sanitizedName}.vpc_id
}

output "vpc_${r.sanitizedName}_private_subnets" {
  description = "Private subnet IDs for ${r.name}"
  value       = module.vpc_${r.sanitizedName}.private_subnet_ids
}`);
        break;

      case 'Lambda':
        outputs.push(`output "lambda_${r.sanitizedName}_arn" {
  description = "Lambda ARN for ${r.name}"
  value       = module.lambda_${r.sanitizedName}.function_arn
}

output "lambda_${r.sanitizedName}_url" {
  description = "Lambda function URL for ${r.name}"
  value       = module.lambda_${r.sanitizedName}.function_url
}`);
        break;

      case 'S3':
        outputs.push(`output "s3_${r.sanitizedName}_bucket" {
  description = "S3 bucket name for ${r.name}"
  value       = module.s3_${r.sanitizedName}.bucket_name
}

output "s3_${r.sanitizedName}_arn" {
  description = "S3 bucket ARN for ${r.name}"
  value       = module.s3_${r.sanitizedName}.bucket_arn
}`);
        break;

      case 'DynamoDB':
        outputs.push(`output "dynamodb_${r.sanitizedName}_name" {
  description = "DynamoDB table name for ${r.name}"
  value       = module.dynamodb_${r.sanitizedName}.table_name
}

output "dynamodb_${r.sanitizedName}_arn" {
  description = "DynamoDB table ARN for ${r.name}"
  value       = module.dynamodb_${r.sanitizedName}.table_arn
}`);
        break;

      case 'RDS':
        outputs.push(`output "rds_${r.sanitizedName}_endpoint" {
  description = "RDS endpoint for ${r.name}"
  value       = module.rds_${r.sanitizedName}.db_instance_endpoint
}

output "rds_${r.sanitizedName}_secret_arn" {
  description = "RDS credentials secret ARN for ${r.name}"
  value       = module.rds_${r.sanitizedName}.db_credentials_secret_arn
}`);
        break;

      case 'Fargate':
        outputs.push(`output "fargate_${r.sanitizedName}_cluster" {
  description = "ECS cluster name for ${r.name}"
  value       = module.fargate_${r.sanitizedName}.cluster_name
}

output "fargate_${r.sanitizedName}_service" {
  description = "ECS service name for ${r.name}"
  value       = module.fargate_${r.sanitizedName}.service_name
}`);
        break;
    }
  }

  return `# =============================================================================
# Outputs
# Generated by React2AWS
# =============================================================================

${outputs.join('\n\n')}
`;
}

function generateBackendTf(region: string): string {
  return `# =============================================================================
# Backend Configuration
# =============================================================================
#
# Uncomment and configure for remote state storage.
# For environment isolation, use Terraform workspaces:
#   terraform workspace new dev
#   terraform workspace new staging
#   terraform workspace new prod
#
# To create the backend resources:
#   aws s3 mb s3://\${PROJECT_NAME}-terraform-state --region ${region}
#   aws dynamodb create-table \\
#     --table-name \${PROJECT_NAME}-terraform-locks \\
#     --attribute-definitions AttributeName=LockID,AttributeType=S \\
#     --key-schema AttributeName=LockID,KeyType=HASH \\
#     --billing-mode PAY_PER_REQUEST \\
#     --region ${region}
#
# =============================================================================

# terraform {
#   backend "s3" {
#     bucket         = "YOUR_PROJECT_NAME-terraform-state"
#     key            = "terraform.tfstate"
#     region         = "${region}"
#     encrypt        = true
#     dynamodb_table = "YOUR_PROJECT_NAME-terraform-locks"
#   }
# }
`;
}

function generateTfvars(resources: ResourceInfo[], region: string): string {
  const fargateResources = resources.filter(r => r.type === 'Fargate');

  const fargateVars = fargateResources.map(f =>
    `${f.sanitizedName}_container_image = "nginx:latest"  # Replace with your image`
  ).join('\n');

  return `# =============================================================================
# Terraform Variables
# Generated by React2AWS
# =============================================================================
#
# For production deployment, set:
#   environment = "production"
#
# This enables production-grade settings:
#   - Multi-AZ deployments
#   - Deletion protection
#   - Enhanced monitoring
#   - Point-in-time recovery
#   - Auto-scaling
#
# =============================================================================

aws_region   = "${region}"
aws_profile  = "default"
environment  = "development"
project_name = "myproject"  # Change this to your project name

vpc_cidr = "10.0.0.0/16"

${fargateVars}
`;
}

export function generateRootFiles(
  resources: AWSResource[],
  region: string
): RootFiles {
  const flatResources = flattenResources(resources);

  return {
    mainTf: generateMainTf(flatResources),
    variablesTf: generateVariablesTf(flatResources),
    outputsTf: generateOutputsTf(flatResources),
    backendTf: generateBackendTf(region),
    tfvars: generateTfvars(flatResources, region),
  };
}
