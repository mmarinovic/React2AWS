import { describe, it, expect } from 'bun:test';
import { generateRootFiles } from '@/lib/generators/environment-generator';
import { parseJSX } from '@/lib/parser/jsx-parser';

describe('generateRootFiles', () => {
  describe('basic generation', () => {
    it('generates all required files', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toBeDefined();
      expect(files.variablesTf).toBeDefined();
      expect(files.outputsTf).toBeDefined();
      expect(files.backendTf).toBeDefined();
      expect(files.tfvars).toBeDefined();
    });

    it('generates files with content', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf.length).toBeGreaterThan(0);
      expect(files.variablesTf.length).toBeGreaterThan(0);
      expect(files.outputsTf.length).toBeGreaterThan(0);
      expect(files.backendTf.length).toBeGreaterThan(0);
      expect(files.tfvars.length).toBeGreaterThan(0);
    });
  });

  describe('main.tf generation', () => {
    it('includes terraform version constraint', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('required_version = ">= 1.0"');
    });

    it('includes AWS provider', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('provider "aws"');
      expect(files.mainTf).toContain('hashicorp/aws');
    });

    it('includes random provider', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('provider "random"');
    });

    it('includes default tags', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('default_tags');
      expect(files.mainTf).toContain('Environment');
      expect(files.mainTf).toContain('ManagedBy');
    });

    it('includes is_production local', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('is_production = var.environment == "production"');
    });
  });

  describe('module calls', () => {
    it('generates S3 module call', () => {
      const { resources } = parseJSX('<S3 name="mybucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "s3_mybucket"');
      expect(files.mainTf).toContain('source = "./modules/s3"');
    });

    it('generates Lambda module call', () => {
      const { resources } = parseJSX('<Lambda name="api" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "lambda_api"');
      expect(files.mainTf).toContain('source = "./modules/lambda"');
    });

    it('generates VPC module call', () => {
      const { resources } = parseJSX('<VPC name="main" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "vpc_main"');
      expect(files.mainTf).toContain('source = "./modules/vpc"');
    });

    it('generates RDS module call', () => {
      const { resources } = parseJSX('<VPC name="main"><RDS name="db" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "rds_db"');
      expect(files.mainTf).toContain('source = "./modules/rds"');
    });

    it('generates DynamoDB module call', () => {
      const { resources } = parseJSX('<DynamoDB name="users" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "dynamodb_users"');
      expect(files.mainTf).toContain('source = "./modules/dynamodb"');
    });

    it('generates Fargate module call', () => {
      const { resources } = parseJSX('<VPC name="main"><Fargate name="web" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "fargate_web"');
      expect(files.mainTf).toContain('source = "./modules/fargate"');
    });

    it('sanitizes resource names with hyphens', () => {
      const { resources } = parseJSX('<S3 name="my-bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "s3_my_bucket"');
    });
  });

  describe('VPC dependencies', () => {
    it('wires Lambda to VPC when nested', () => {
      const code = `
        <VPC name="main">
          <Lambda name="api" />
        </VPC>
      `;
      const { resources } = parseJSX(code);
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module.vpc_main.vpc_id');
      expect(files.mainTf).toContain('module.vpc_main.private_subnet_ids');
    });

    it('wires RDS to VPC when nested', () => {
      const code = `
        <VPC name="network">
          <RDS name="database" />
        </VPC>
      `;
      const { resources } = parseJSX(code);
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module.vpc_network.vpc_id');
      expect(files.mainTf).toContain('module.vpc_network.private_subnet_ids');
    });

    it('wires Fargate to VPC when nested', () => {
      const code = `
        <VPC name="myvpc">
          <Fargate name="service" />
        </VPC>
      `;
      const { resources } = parseJSX(code);
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module.vpc_myvpc.vpc_id');
      expect(files.mainTf).toContain('module.vpc_myvpc.private_subnet_ids');
    });
  });

  describe('cross-resource access', () => {
    it('Lambda gets S3 bucket ARNs', () => {
      const code = '<S3 name="assets" /><Lambda name="processor" />';
      const { resources } = parseJSX(code);
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('s3_bucket_arns');
      expect(files.mainTf).toContain('module.s3_assets.bucket_arn');
    });

    it('Lambda gets DynamoDB table ARNs', () => {
      const code = '<DynamoDB name="users" /><Lambda name="api" />';
      const { resources } = parseJSX(code);
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('dynamodb_table_arns');
      expect(files.mainTf).toContain('module.dynamodb_users.table_arn');
    });

    it('Lambda gets RDS secrets ARNs', () => {
      const code = `
        <VPC name="main">
          <RDS name="db" />
          <Lambda name="api" />
        </VPC>
      `;
      const { resources } = parseJSX(code);
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('secrets_arns');
      expect(files.mainTf).toContain('module.rds_db.db_credentials_secret_arn');
    });
  });

  describe('environment-aware configuration', () => {
    it('uses is_production for VPC NAT gateway', () => {
      const { resources } = parseJSX('<VPC name="main" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toMatch(/single_nat_gateway = local\.is_production \? false : (true|false)/);
    });

    it('uses is_production for RDS instance class', () => {
      const { resources } = parseJSX('<VPC name="main"><RDS name="db" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('instance_class = local.is_production ?');
    });

    it('uses is_production for RDS multi-az', () => {
      const { resources } = parseJSX('<VPC name="main"><RDS name="db" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('multi_az                = local.is_production');
    });

    it('uses is_production for RDS deletion protection', () => {
      const { resources } = parseJSX('<VPC name="main"><RDS name="db" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('deletion_protection     = local.is_production');
    });

    it('uses is_production for DynamoDB point-in-time recovery', () => {
      const { resources } = parseJSX('<DynamoDB name="users" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('enable_point_in_time_recovery = local.is_production');
    });

    it('uses is_production for Fargate autoscaling', () => {
      const { resources } = parseJSX('<VPC name="main"><Fargate name="api" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('enable_autoscaling       = local.is_production');
    });

    it('uses is_production for RDS monitoring', () => {
      const { resources } = parseJSX('<VPC name="main"><RDS name="db" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('monitoring_interval          = local.is_production ? 60 : 0');
      expect(files.mainTf).toContain('performance_insights_enabled = local.is_production');
    });
  });

  describe('variables.tf generation', () => {
    it('includes aws_region variable', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.variablesTf).toContain('variable "aws_region"');
    });

    it('includes environment variable with default development', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.variablesTf).toContain('variable "environment"');
      expect(files.variablesTf).toContain('default     = "development"');
    });

    it('includes project_name variable', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.variablesTf).toContain('variable "project_name"');
    });

    it('includes vpc_cidr variable', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.variablesTf).toContain('variable "vpc_cidr"');
    });

    it('generates Fargate container image variables', () => {
      const { resources } = parseJSX('<VPC name="main"><Fargate name="web" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.variablesTf).toContain('variable "web_container_image"');
    });
  });

  describe('outputs.tf generation', () => {
    it('generates VPC outputs', () => {
      const { resources } = parseJSX('<VPC name="main" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.outputsTf).toContain('output "vpc_main_id"');
      expect(files.outputsTf).toContain('output "vpc_main_private_subnets"');
    });

    it('generates Lambda outputs', () => {
      const { resources } = parseJSX('<Lambda name="api" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.outputsTf).toContain('output "lambda_api_arn"');
      expect(files.outputsTf).toContain('output "lambda_api_url"');
    });

    it('generates S3 outputs', () => {
      const { resources } = parseJSX('<S3 name="assets" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.outputsTf).toContain('output "s3_assets_bucket"');
      expect(files.outputsTf).toContain('output "s3_assets_arn"');
    });

    it('generates DynamoDB outputs', () => {
      const { resources } = parseJSX('<DynamoDB name="users" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.outputsTf).toContain('output "dynamodb_users_name"');
      expect(files.outputsTf).toContain('output "dynamodb_users_arn"');
    });

    it('generates RDS outputs', () => {
      const { resources } = parseJSX('<VPC name="main"><RDS name="db" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.outputsTf).toContain('output "rds_db_endpoint"');
      expect(files.outputsTf).toContain('output "rds_db_secret_arn"');
    });

    it('generates Fargate outputs', () => {
      const { resources } = parseJSX('<VPC name="main"><Fargate name="api" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.outputsTf).toContain('output "fargate_api_cluster"');
      expect(files.outputsTf).toContain('output "fargate_api_service"');
    });
  });

  describe('backend.tf generation', () => {
    it('includes S3 backend configuration (commented)', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.backendTf).toContain('backend "s3"');
    });

    it('includes workspace instructions', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.backendTf).toContain('terraform workspace');
    });

    it('uses provided region', () => {
      const files = generateRootFiles(parseJSX('<S3 name="x" />').resources, 'eu-west-1');

      expect(files.backendTf).toContain('region         = "eu-west-1"');
    });

    it('includes DynamoDB lock table reference', () => {
      const { resources } = parseJSX('<S3 name="bucket" />');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.backendTf).toContain('dynamodb_table');
    });
  });

  describe('terraform.tfvars generation', () => {
    it('includes region', () => {
      const files = generateRootFiles(parseJSX('<S3 name="x" />').resources, 'ap-southeast-1');

      expect(files.tfvars).toContain('aws_region   = "ap-southeast-1"');
    });

    it('defaults to development environment', () => {
      const files = generateRootFiles(parseJSX('<S3 name="x" />').resources, 'us-east-1');

      expect(files.tfvars).toContain('environment  = "development"');
    });

    it('includes production instructions', () => {
      const files = generateRootFiles(parseJSX('<S3 name="x" />').resources, 'us-east-1');

      expect(files.tfvars).toContain('For production deployment');
      expect(files.tfvars).toContain('environment = "production"');
    });

    it('includes Fargate container image variables', () => {
      const { resources } = parseJSX('<VPC name="main"><Fargate name="api" /></VPC>');
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.tfvars).toContain('api_container_image = "nginx:latest"');
    });
  });

  describe('Infrastructure wrapper handling', () => {
    it('flattens Infrastructure children', () => {
      const code = `
        <Infrastructure name="app">
          <S3 name="bucket" />
          <Lambda name="api" />
        </Infrastructure>
      `;
      const { resources } = parseJSX(code);
      const files = generateRootFiles(resources, 'us-east-1');

      expect(files.mainTf).toContain('module "s3_bucket"');
      expect(files.mainTf).toContain('module "lambda_api"');
      expect(files.mainTf).not.toContain('module "infrastructure_');
    });
  });
});
