import { SecurityGroupResource } from '@/types/aws';

export function generateSecurityGroup(resource: SecurityGroupResource, vpcName?: string): string {
  const { name } = resource;

  const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
  const vpcSanitized = vpcName?.replace(/[^a-zA-Z0-9_]/g, '_') || 'main';

  if (!vpcName) {
    return `# Security Group "${name}" requires a VPC parent
# Wrap your SecurityGroup in a <VPC> component:
#
# <VPC className="cidr-10.0.0.0/16" name="main">
#   <SecurityGroup name="${name}" />
# </VPC>`;
  }

  return `# Security Group: ${name}
resource "aws_security_group" "${sanitizedName}" {
  name        = "\${var.project_name}-${name}-sg"
  description = var.${sanitizedName}_description
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id

  # Dynamic ingress rules
  dynamic "ingress" {
    for_each = var.${sanitizedName}_ingress_rules
    content {
      description      = ingress.value.description
      from_port        = ingress.value.from_port
      to_port          = ingress.value.to_port
      protocol         = ingress.value.protocol
      cidr_blocks      = lookup(ingress.value, "cidr_blocks", null)
      ipv6_cidr_blocks = lookup(ingress.value, "ipv6_cidr_blocks", null)
      security_groups  = lookup(ingress.value, "security_groups", null)
      self             = lookup(ingress.value, "self", null)
    }
  }

  # Dynamic egress rules
  dynamic "egress" {
    for_each = var.${sanitizedName}_egress_rules
    content {
      description      = egress.value.description
      from_port        = egress.value.from_port
      to_port          = egress.value.to_port
      protocol         = egress.value.protocol
      cidr_blocks      = lookup(egress.value, "cidr_blocks", null)
      ipv6_cidr_blocks = lookup(egress.value, "ipv6_cidr_blocks", null)
      security_groups  = lookup(egress.value, "security_groups", null)
      self             = lookup(egress.value, "self", null)
    }
  }

  tags = {
    Name        = "\${var.project_name}-${name}-sg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }

  lifecycle {
    create_before_destroy = true
  }
}`;
}

export function generateSecurityGroupOutputs(resource: SecurityGroupResource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');

  return `output "${sanitizedName}_security_group_id" {
  description = "Security group ID for ${resource.name}"
  value       = aws_security_group.${sanitizedName}.id
}

output "${sanitizedName}_security_group_arn" {
  description = "Security group ARN for ${resource.name}"
  value       = aws_security_group.${sanitizedName}.arn
}`;
}

export function generateSecurityGroupVariables(resource: SecurityGroupResource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');

  return `variable "${sanitizedName}_description" {
  description = "Description for ${resource.name} security group"
  type        = string
  default     = "Security group for ${resource.name}"
}

variable "${sanitizedName}_ingress_rules" {
  description = "Ingress rules for ${resource.name} security group"
  type = list(object({
    description      = string
    from_port        = number
    to_port          = number
    protocol         = string
    cidr_blocks      = optional(list(string))
    ipv6_cidr_blocks = optional(list(string))
    security_groups  = optional(list(string))
    self             = optional(bool)
  }))
  default = [
    {
      description = "Allow HTTPS"
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "Allow HTTP"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

variable "${sanitizedName}_egress_rules" {
  description = "Egress rules for ${resource.name} security group"
  type = list(object({
    description      = string
    from_port        = number
    to_port          = number
    protocol         = string
    cidr_blocks      = optional(list(string))
    ipv6_cidr_blocks = optional(list(string))
    security_groups  = optional(list(string))
    self             = optional(bool)
  }))
  default = [
    {
      description = "Allow all outbound"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}`;
}

