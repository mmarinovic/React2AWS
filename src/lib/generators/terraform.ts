import { AWSResource, ParseResult, TerraformOutput } from '@/types/aws';
import { generateRDS, generateRDSOutputs, generateRDSVariables } from './rds';
import { generateFargate, generateFargateOutputs, generateFargateVariables } from './fargate';
import { generateEC2, generateEC2Outputs, generateEC2Variables } from './ec2';
import { generateS3, generateS3Outputs } from './s3';
import { generateLambda, generateLambdaOutputs, generateLambdaVariables } from './lambda';
import { generateDynamoDB, generateDynamoDBOutputs, generateDynamoDBVariables } from './dynamodb';
import { generateVPC, generateVPCOutputs, generateVPCVariables } from './vpc';
import { generateALB, generateALBOutputs, generateALBVariables } from './alb';
import { generateSecurityGroup, generateSecurityGroupOutputs, generateSecurityGroupVariables } from './security-group';

// Collect all regions from resources
function collectRegions(resources: AWSResource[]): Set<string> {
  const regions = new Set<string>();

  function traverse(resource: AWSResource) {
    if ('region' in resource && resource.region) {
      regions.add(resource.region);
    }
    if (resource.children) {
      resource.children.forEach(traverse);
    }
  }

  resources.forEach(traverse);

  // Default to us-east-1 if no region specified
  if (regions.size === 0) {
    regions.add('us-east-1');
  }

  return regions;
}

// Generate Terraform for a single resource
function generateResourceTerraform(resource: AWSResource, vpcName?: string): string {
  switch (resource.type) {
    case 'RDS':
      return generateRDS(resource, vpcName);
    case 'Fargate':
      return generateFargate(resource, vpcName);
    case 'EC2':
      return generateEC2(resource, vpcName);
    case 'S3':
      return generateS3(resource);
    case 'Lambda':
      return generateLambda(resource, vpcName);
    case 'DynamoDB':
      return generateDynamoDB(resource);
    case 'VPC':
      return generateVPC(resource);
    case 'ALB':
      return generateALB(resource, vpcName);
    case 'SecurityGroup':
      return generateSecurityGroup(resource, vpcName);
    default:
      return '';
  }
}

// Generate outputs for a single resource
function generateResourceOutputs(resource: AWSResource): string {
  switch (resource.type) {
    case 'RDS':
      return generateRDSOutputs(resource);
    case 'Fargate':
      return generateFargateOutputs(resource);
    case 'EC2':
      return generateEC2Outputs(resource);
    case 'S3':
      return generateS3Outputs(resource);
    case 'Lambda':
      return generateLambdaOutputs(resource);
    case 'DynamoDB':
      return generateDynamoDBOutputs(resource);
    case 'VPC':
      return generateVPCOutputs(resource);
    case 'ALB':
      return generateALBOutputs(resource);
    case 'SecurityGroup':
      return generateSecurityGroupOutputs(resource);
    default:
      return '';
  }
}

// Generate variables for a single resource
function generateResourceVariables(resource: AWSResource): string {
  switch (resource.type) {
    case 'RDS':
      return generateRDSVariables(resource);
    case 'Fargate':
      return generateFargateVariables(resource);
    case 'EC2':
      return generateEC2Variables(resource);
    case 'Lambda':
      return generateLambdaVariables(resource);
    case 'DynamoDB':
      return generateDynamoDBVariables(resource);
    case 'VPC':
      return generateVPCVariables();
    case 'ALB':
      return generateALBVariables(resource);
    case 'SecurityGroup':
      return generateSecurityGroupVariables(resource);
    default:
      return '';
  }
}

// Recursively generate Terraform for all resources
function generateAllResources(resources: AWSResource[], vpcName?: string): { 
  main: string[]; 
  outputs: string[]; 
  variables: string[]; 
} {
  const main: string[] = [];
  const outputs: string[] = [];
  const variables: string[] = [];

  for (const resource of resources) {
    if (resource.type === 'Infrastructure') {
      // Infrastructure is just a wrapper, process children
      if (resource.children) {
        const result = generateAllResources(resource.children, vpcName);
        main.push(...result.main);
        outputs.push(...result.outputs);
        variables.push(...result.variables);
      }
    } else if (resource.type === 'VPC') {
      // Generate VPC first
      main.push(generateResourceTerraform(resource));
      outputs.push(generateResourceOutputs(resource));
      variables.push(generateResourceVariables(resource));
      // Then generate children with VPC reference
      if (resource.children) {
        const result = generateAllResources(resource.children, resource.name);
        main.push(...result.main);
        outputs.push(...result.outputs);
        variables.push(...result.variables);
      }
    } else {
      main.push(generateResourceTerraform(resource, vpcName));
      outputs.push(generateResourceOutputs(resource));
      variables.push(generateResourceVariables(resource));
    }
  }

  return {
    main: main.filter(Boolean),
    outputs: outputs.filter(Boolean),
    variables: variables.filter(Boolean),
  };
}

// Generate base variables that are common to all configurations
function generateBaseVariables(): string {
  return `# =============================================================================
# Base Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "environment" {
  description = "Environment name (e.g., development, staging, production)"
  type        = string
  default     = "development"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "react2aws"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,20}$", var.project_name))
    error_message = "Project name must be lowercase, start with a letter, and be max 21 characters."
  }
}`;
}

// Generate backend configuration
function generateBackendConfig(region: string): string {
  return `# =============================================================================
# Backend Configuration (Optional)
# =============================================================================
#
# Remote state storage in S3. Uncomment and configure if needed.
# For local development, you can delete this file and use local state.
#
# To create the backend resources:
#   aws s3 mb s3://<YOUR_BUCKET_NAME> --region ${region}
#   aws dynamodb create-table --table-name terraform-locks \\
#     --attribute-definitions AttributeName=LockID,AttributeType=S \\
#     --key-schema AttributeName=LockID,KeyType=HASH \\
#     --billing-mode PAY_PER_REQUEST --region ${region}
#
# =============================================================================

# terraform {
#   backend "s3" {
#     bucket         = "<YOUR_BUCKET_NAME>"
#     key            = "terraform.tfstate"
#     region         = "${region}"
#     encrypt        = true
#     dynamodb_table = "terraform-locks"
#   }
# }`;
}

// Generate terraform.tfvars.example
function generateTfvarsExample(region: string): string {
  return `# =============================================================================
# Terraform Variables Example
# =============================================================================
#
# Copy this file to terraform.tfvars and update the values.
# Do NOT commit terraform.tfvars to version control (it may contain secrets).
#
# =============================================================================

# AWS Configuration
aws_region  = "${region}"
aws_profile = "default"  # Your AWS CLI profile

# Environment
environment  = "development"  # development, staging, or production
project_name = "myproject"    # Prefix for all resource names

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# =============================================================================
# Resource-specific variables
# =============================================================================
# Add resource-specific variable values below as needed.
# See variables.tf for all available variables and their defaults.
#
# Example:
# mydb_instance_class        = "db.t4g.small"
# mydb_allocated_storage     = 50
# mydb_max_allocated_storage = 200
#
# api_service_container_image = "123456789.dkr.ecr.us-east-1.amazonaws.com/myapp:latest"
`;
}

// Generate the complete Terraform output
function generateFullTerraformOutput(parseResult: ParseResult): TerraformOutput {
  const regions = collectRegions(parseResult.resources);
  const region = Array.from(regions)[0] || 'us-east-1';
  
  const { main, outputs, variables } = generateAllResources(parseResult.resources);

  const header = `# =============================================================================
# Generated by React2AWS
# https://github.com/mmarinovic/React2AWS
# =============================================================================
#
# This Terraform configuration was generated from React2AWS components.
# Review and customize before applying to your infrastructure.
#
# Quick Start:
#   1. Copy terraform.tfvars.example to terraform.tfvars
#   2. Update backend.tf with your S3 bucket
#   3. Run: terraform init
#   4. Run: terraform plan
#   5. Run: terraform apply
#
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

# =============================================================================
# Provider Configuration
# =============================================================================

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
`;

  const mainTf = [header, ...main].join('\n\n');
  
  const variablesTf = `# =============================================================================
# Variables
# =============================================================================
# Generated by React2AWS

${generateBaseVariables()}

# =============================================================================
# Resource Variables
# =============================================================================

${variables.join('\n\n')}`;

  const outputsTf = `# =============================================================================
# Outputs
# =============================================================================
# Generated by React2AWS

${outputs.join('\n\n')}`;

  return {
    mainTf,
    variablesTf,
    outputsTf,
    backendTf: generateBackendConfig(region),
    tfvarsExample: generateTfvarsExample(region),
  };
}

export function generateTerraformFiles(parseResult: ParseResult): TerraformOutput | null {
  if (parseResult.errors.length > 0 || parseResult.resources.length === 0) {
    return null;
  }

  return generateFullTerraformOutput(parseResult);
}
