export type AWSResourceType = 
  | 'RDS'
  | 'Fargate'
  | 'EC2'
  | 'S3'
  | 'Lambda'
  | 'DynamoDB'
  | 'VPC'
  | 'ALB'
  | 'SecurityGroup'
  | 'Infrastructure';

export interface ParsedClass {
  prefix: string;
  value: string;
}

export interface BaseResource {
  type: AWSResourceType;
  name: string;
  className: string;
  parsedClasses: ParsedClass[];
  children?: AWSResource[];
}

export interface RDSResource extends BaseResource {
  type: 'RDS';
  engine?: string;
  instanceClass?: string;
  storage?: number;
  maxStorage?: number;
  multiAz?: boolean;
  region?: string;
  backupRetention?: number;
  deletionProtection?: boolean;
}

export interface FargateResource extends BaseResource {
  type: 'Fargate';
  memory?: number;
  cpu?: number;
  region?: string;
  desiredCount?: number;
  port?: number;
}

export interface EC2Resource extends BaseResource {
  type: 'EC2';
  instanceType?: string;
  storage?: number;
  region?: string;
}

export interface S3Resource extends BaseResource {
  type: 'S3';
  acl?: string;
  versioned?: boolean;
  encrypted?: boolean;
}

export interface LambdaResource extends BaseResource {
  type: 'Lambda';
  runtime?: string;
  memory?: number;
  timeout?: number;
}

export interface DynamoDBResource extends BaseResource {
  type: 'DynamoDB';
  billingMode?: string;
}

export interface VPCResource extends BaseResource {
  type: 'VPC';
  cidr?: string;
  region?: string;
  enableNatGateway?: boolean;
  singleNatGateway?: boolean;
  enableVpnGateway?: boolean;
}

export interface ALBResource extends BaseResource {
  type: 'ALB';
  internal?: boolean;
}

export interface SecurityGroupResource extends BaseResource {
  type: 'SecurityGroup';
  ingressRules?: IngressRule[];
  egressRules?: EgressRule[];
}

export interface IngressRule {
  fromPort: number;
  toPort: number;
  protocol: string;
  cidrBlocks?: string[];
  description?: string;
}

export interface EgressRule {
  fromPort: number;
  toPort: number;
  protocol: string;
  cidrBlocks?: string[];
  description?: string;
}

export interface InfrastructureResource extends BaseResource {
  type: 'Infrastructure';
}

export type AWSResource = 
  | RDSResource
  | FargateResource
  | EC2Resource
  | S3Resource
  | LambdaResource
  | DynamoDBResource
  | VPCResource
  | ALBResource
  | SecurityGroupResource
  | InfrastructureResource;

export interface ParseResult {
  resources: AWSResource[];
  errors: string[];
}

// New types for module-based output
export interface TerraformOutput {
  mainTf: string;
  variablesTf: string;
  outputsTf: string;
  backendTf: string;
  tfvarsExample: string;
}

export interface GeneratorContext {
  environment: string;
  region: string;
  projectName: string;
  vpcName?: string;
}
