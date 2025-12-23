import { AWSResource, ParseResult, TerraformOutput, TerraformFileTree, ModuleFiles } from '@/types/aws';
import {
  generateVPCModule,
  generateLambdaModule,
  generateS3Module,
  generateDynamoDBModule,
  generateRDSModule,
  generateFargateModule,
} from './modules';
import { generateRootFiles } from './environment-generator';
import { generateReadme } from './readme-generator';

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

  if (regions.size === 0) {
    regions.add('us-east-1');
  }

  return regions;
}

function collectUniqueResourceTypes(resources: AWSResource[]): Set<string> {
  const types = new Set<string>();

  function traverse(resource: AWSResource) {
    if (resource.type !== 'Infrastructure') {
      types.add(resource.type);
    }
    if (resource.children) {
      resource.children.forEach(traverse);
    }
  }

  resources.forEach(traverse);
  return types;
}

function generateModuleForType(type: string): ModuleFiles | null {
  switch (type) {
    case 'VPC':
      return generateVPCModule();
    case 'Lambda':
      return generateLambdaModule();
    case 'S3':
      return generateS3Module();
    case 'DynamoDB':
      return generateDynamoDBModule();
    case 'RDS':
      return generateRDSModule();
    case 'Fargate':
      return generateFargateModule();
    default:
      return null;
  }
}

function generateModularOutput(parseResult: ParseResult): TerraformFileTree {
  const files: TerraformFileTree = {};
  const regions = collectRegions(parseResult.resources);
  const region = Array.from(regions)[0] || 'us-east-1';

  const resourceTypes = collectUniqueResourceTypes(parseResult.resources);

  for (const type of resourceTypes) {
    const moduleFiles = generateModuleForType(type);
    if (moduleFiles) {
      const typeLower = type.toLowerCase();
      files[`modules/${typeLower}/main.tf`] = moduleFiles.mainTf;
      files[`modules/${typeLower}/variables.tf`] = moduleFiles.variablesTf;
      files[`modules/${typeLower}/outputs.tf`] = moduleFiles.outputsTf;
    }
  }

  const rootFiles = generateRootFiles(parseResult.resources, region);
  files['main.tf'] = rootFiles.mainTf;
  files['variables.tf'] = rootFiles.variablesTf;
  files['outputs.tf'] = rootFiles.outputsTf;
  files['backend.tf'] = rootFiles.backendTf;
  files['terraform.tfvars'] = rootFiles.tfvars;

  files['README.md'] = generateReadme(parseResult.resources, region);

  return files;
}

export function generateTerraformFiles(parseResult: ParseResult): TerraformOutput | null {
  if (parseResult.errors.length > 0 || parseResult.resources.length === 0) {
    return null;
  }

  const fileTree = generateModularOutput(parseResult);
  return { fileTree };
}
