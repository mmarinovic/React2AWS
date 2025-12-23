import { VPCResource } from '@/types/aws';

export function generateVPC(resource: VPCResource): string {
  const {
    name,
    cidr = '10.0.0.0/16',
    region = 'us-east-1',
    enableNatGateway = true,
    singleNatGateway = true,
    enableVpnGateway = false,
  } = resource;

  const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');

  // Calculate subnets from CIDR
  const cidrBase = cidr.split('/')[0].split('.').slice(0, 2).join('.');

  return `# VPC Module using terraform-aws-modules/vpc/aws
# https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest

module "${sanitizedName}_vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.18.1"

  name = var.project_name != "" ? "\${var.project_name}-\${var.environment}-vpc" : "${name}-vpc"
  cidr = var.vpc_cidr

  azs             = ["\${var.aws_region}a", "\${var.aws_region}b", "\${var.aws_region}c"]
  private_subnets = ["${cidrBase}.128.0/20", "${cidrBase}.144.0/20", "${cidrBase}.160.0/20"]
  public_subnets  = ["${cidrBase}.0.0/20", "${cidrBase}.16.0/20", "${cidrBase}.32.0/20"]

  enable_nat_gateway     = ${enableNatGateway}
  single_nat_gateway     = ${singleNatGateway}
  one_nat_gateway_per_az = ${!singleNatGateway && enableNatGateway}
  enable_vpn_gateway     = ${enableVpnGateway}

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Terraform   = "true"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

# VPC Endpoints for private subnet access to AWS services
module "${sanitizedName}_vpc_endpoints" {
  source  = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"
  version = "5.18.1"

  vpc_id = module.${sanitizedName}_vpc.vpc_id

  endpoints = {
    s3 = {
      service         = "s3"
      service_type    = "Gateway"
      route_table_ids = module.${sanitizedName}_vpc.private_route_table_ids
      tags            = { Name = "\${var.project_name}-s3-endpoint" }
    }
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}`;
}

export function generateVPCOutputs(resource: VPCResource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');

  return `output "${sanitizedName}_vpc_id" {
  description = "VPC ID for ${resource.name}"
  value       = module.${sanitizedName}_vpc.vpc_id
}

output "${sanitizedName}_private_subnets" {
  description = "Private subnet IDs for ${resource.name}"
  value       = module.${sanitizedName}_vpc.private_subnets
}

output "${sanitizedName}_public_subnets" {
  description = "Public subnet IDs for ${resource.name}"
  value       = module.${sanitizedName}_vpc.public_subnets
}

output "${sanitizedName}_private_route_table_ids" {
  description = "Private route table IDs for ${resource.name}"
  value       = module.${sanitizedName}_vpc.private_route_table_ids
}`;
}

export function generateVPCVariables(): string {
  return `variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}`;
}
