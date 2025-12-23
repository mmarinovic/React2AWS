import { describe, it, expect } from 'bun:test';
import { generateTerraformFiles } from '@/lib/generators/terraform';
import { parseJSX } from '@/lib/parser/jsx-parser';
import { ParseResult } from '@/types/aws';

describe('generateTerraformFiles', () => {
  describe('basic functionality', () => {
    it('returns null for empty resources', () => {
      const parseResult: ParseResult = { resources: [], errors: [] };
      const result = generateTerraformFiles(parseResult);
      expect(result).toBeNull();
    });

    it('returns null when parse errors exist', () => {
      const parseResult: ParseResult = {
        resources: [{ type: 'S3', name: 'bucket', className: '', parsedClasses: [] }],
        errors: ['Some error'],
      };
      const result = generateTerraformFiles(parseResult);
      expect(result).toBeNull();
    });

    it('returns TerraformOutput with fileTree for valid input', () => {
      const parseResult = parseJSX('<S3 name="mybucket" />');
      const result = generateTerraformFiles(parseResult);
      expect(result).not.toBeNull();
      expect(result!.fileTree).toBeDefined();
    });
  });

  describe('module generation', () => {
    it('generates S3 module for S3 resource', () => {
      const parseResult = parseJSX('<S3 name="mybucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/s3/main.tf']).toBeDefined();
      expect(result.fileTree['modules/s3/variables.tf']).toBeDefined();
      expect(result.fileTree['modules/s3/outputs.tf']).toBeDefined();
    });

    it('generates Lambda module for Lambda resource', () => {
      const parseResult = parseJSX('<Lambda name="api" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/lambda/main.tf']).toBeDefined();
      expect(result.fileTree['modules/lambda/variables.tf']).toBeDefined();
      expect(result.fileTree['modules/lambda/outputs.tf']).toBeDefined();
    });

    it('generates VPC module for VPC resource', () => {
      const parseResult = parseJSX('<VPC name="main" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/vpc/main.tf']).toBeDefined();
      expect(result.fileTree['modules/vpc/variables.tf']).toBeDefined();
      expect(result.fileTree['modules/vpc/outputs.tf']).toBeDefined();
    });

    it('generates RDS module for RDS resource', () => {
      const parseResult = parseJSX('<RDS name="database" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/rds/main.tf']).toBeDefined();
      expect(result.fileTree['modules/rds/variables.tf']).toBeDefined();
      expect(result.fileTree['modules/rds/outputs.tf']).toBeDefined();
    });

    it('generates DynamoDB module for DynamoDB resource', () => {
      const parseResult = parseJSX('<DynamoDB name="users" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/dynamodb/main.tf']).toBeDefined();
      expect(result.fileTree['modules/dynamodb/variables.tf']).toBeDefined();
      expect(result.fileTree['modules/dynamodb/outputs.tf']).toBeDefined();
    });

    it('generates Fargate module for Fargate resource', () => {
      const parseResult = parseJSX('<Fargate name="api" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/fargate/main.tf']).toBeDefined();
      expect(result.fileTree['modules/fargate/variables.tf']).toBeDefined();
      expect(result.fileTree['modules/fargate/outputs.tf']).toBeDefined();
    });

    it('generates multiple modules for multiple resource types', () => {
      const code = '<S3 name="bucket" /><Lambda name="api" /><DynamoDB name="data" />';
      const parseResult = parseJSX(code);
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/s3/main.tf']).toBeDefined();
      expect(result.fileTree['modules/lambda/main.tf']).toBeDefined();
      expect(result.fileTree['modules/dynamodb/main.tf']).toBeDefined();
    });

    it('deduplicates module types for same resource type', () => {
      const code = '<S3 name="bucket1" /><S3 name="bucket2" />';
      const parseResult = parseJSX(code);
      const result = generateTerraformFiles(parseResult)!;

      const s3Files = Object.keys(result.fileTree).filter(k => k.startsWith('modules/s3/'));
      expect(s3Files).toHaveLength(3);
    });

    it('generates modules from nested resources', () => {
      const code = `
        <VPC name="main">
          <Lambda name="api" />
          <RDS name="db" />
        </VPC>
      `;
      const parseResult = parseJSX(code);
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/vpc/main.tf']).toBeDefined();
      expect(result.fileTree['modules/lambda/main.tf']).toBeDefined();
      expect(result.fileTree['modules/rds/main.tf']).toBeDefined();
    });

    it('excludes Infrastructure type from modules', () => {
      const code = `
        <Infrastructure name="app">
          <S3 name="bucket" />
        </Infrastructure>
      `;
      const parseResult = parseJSX(code);
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/infrastructure/main.tf']).toBeUndefined();
      expect(result.fileTree['modules/s3/main.tf']).toBeDefined();
    });
  });

  describe('root file generation', () => {
    it('generates all root-level files', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['main.tf']).toBeDefined();
      expect(result.fileTree['variables.tf']).toBeDefined();
      expect(result.fileTree['outputs.tf']).toBeDefined();
      expect(result.fileTree['backend.tf']).toBeDefined();
      expect(result.fileTree['terraform.tfvars']).toBeDefined();
    });

    it('includes terraform version constraint in main.tf', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['main.tf']).toContain('required_version');
    });

    it('includes AWS provider configuration', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['main.tf']).toContain('provider "aws"');
    });

    it('includes S3 backend configuration in backend.tf', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['backend.tf']).toContain('backend "s3"');
    });

    it('includes is_production local for environment-aware settings', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['main.tf']).toContain('is_production = var.environment == "production"');
    });
  });

  describe('README generation', () => {
    it('generates README.md', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['README.md']).toBeDefined();
    });

    it('README contains Terraform Infrastructure title', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['README.md']).toContain('# Terraform Infrastructure');
    });

    it('README lists resources', () => {
      const parseResult = parseJSX('<S3 name="mybucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['README.md']).toContain('S3');
    });
  });

  describe('region handling', () => {
    it('defaults to us-east-1 when no region specified', () => {
      const parseResult = parseJSX('<S3 name="bucket" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['terraform.tfvars']).toContain('us-east-1');
    });

    it('uses region from resource when specified', () => {
      const parseResult = parseJSX('<VPC name="main" className="region-eu-west-1" />');
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['terraform.tfvars']).toContain('eu-west-1');
    });

    it('uses first region when multiple regions present', () => {
      const code = `
        <VPC name="vpc1" className="region-us-west-2" />
        <VPC name="vpc2" className="region-eu-central-1" />
      `;
      const parseResult = parseJSX(code);
      const result = generateTerraformFiles(parseResult)!;

      const tfvars = result.fileTree['terraform.tfvars'];
      expect(tfvars).toMatch(/aws_region.*=.*(us-west-2|eu-central-1)/);
    });

    it('extracts region from nested resources', () => {
      const code = `
        <Infrastructure name="app">
          <VPC name="main" className="region-ap-southeast-1" />
        </Infrastructure>
      `;
      const parseResult = parseJSX(code);
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['terraform.tfvars']).toContain('ap-southeast-1');
    });
  });

  describe('complete infrastructure', () => {
    it('generates complete output for full-stack app', () => {
      const code = `
        <Infrastructure name="fullstack">
          <VPC name="main">
            <Lambda name="api" />
            <RDS name="db" />
            <Fargate name="web" />
          </VPC>
          <S3 name="assets" />
          <DynamoDB name="sessions" />
        </Infrastructure>
      `;
      const parseResult = parseJSX(code);
      const result = generateTerraformFiles(parseResult)!;

      expect(result.fileTree['modules/vpc/main.tf']).toBeDefined();
      expect(result.fileTree['modules/lambda/main.tf']).toBeDefined();
      expect(result.fileTree['modules/rds/main.tf']).toBeDefined();
      expect(result.fileTree['modules/fargate/main.tf']).toBeDefined();
      expect(result.fileTree['modules/s3/main.tf']).toBeDefined();
      expect(result.fileTree['modules/dynamodb/main.tf']).toBeDefined();

      expect(result.fileTree['main.tf']).toBeDefined();
      expect(result.fileTree['variables.tf']).toBeDefined();
      expect(result.fileTree['outputs.tf']).toBeDefined();

      expect(result.fileTree['README.md']).toBeDefined();

      const totalFiles = Object.keys(result.fileTree).length;
      expect(totalFiles).toBeGreaterThanOrEqual(6 * 3 + 5 + 1);
    });

    it('file tree structure is consistent', () => {
      const parseResult = parseJSX('<Lambda name="api" />');
      const result = generateTerraformFiles(parseResult)!;

      const paths = Object.keys(result.fileTree);

      const moduleFiles = paths.filter(p => p.startsWith('modules/'));
      const rootFiles = paths.filter(p => !p.includes('/'));

      expect(moduleFiles.length).toBeGreaterThan(0);
      expect(rootFiles.length).toBe(6);
      expect(rootFiles).toContain('README.md');
      expect(rootFiles).toContain('main.tf');
      expect(rootFiles).toContain('variables.tf');
      expect(rootFiles).toContain('outputs.tf');
      expect(rootFiles).toContain('backend.tf');
      expect(rootFiles).toContain('terraform.tfvars');
    });
  });
});
