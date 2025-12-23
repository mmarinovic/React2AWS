import { EC2Resource } from '@/types/aws';

export function generateEC2(resource: EC2Resource, vpcName?: string): string {
  const {
    name,
    instanceType = 't3.micro',
    storage = 8,
  } = resource;

  const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
  const vpcSanitized = vpcName?.replace(/[^a-zA-Z0-9_]/g, '_') || 'main';

  const securityGroup = vpcName ? `
# Security Group for ${name} EC2 Instance
resource "aws_security_group" "${sanitizedName}_sg" {
  name        = "\${var.project_name}-${name}-ec2-sg"
  description = "Security group for ${name} EC2 instance"
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id

  # SSH access (restrict in production!)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.${sanitizedName}_ssh_cidr_blocks
  }

  # HTTP
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${var.project_name}-${name}-ec2-sg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}` : '';

  return `# EC2 Instance: ${name}

# Get latest Amazon Linux 2023 AMI
data "aws_ami" "${sanitizedName}_ami" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}
${securityGroup}

# IAM Role for EC2 Instance
resource "aws_iam_role" "${sanitizedName}_role" {
  name = "\${var.project_name}-${name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "\${var.project_name}-${name}-ec2-role"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

resource "aws_iam_role_policy_attachment" "${sanitizedName}_ssm" {
  role       = aws_iam_role.${sanitizedName}_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "${sanitizedName}_profile" {
  name = "\${var.project_name}-${name}-ec2-profile"
  role = aws_iam_role.${sanitizedName}_role.name
}

# EC2 Instance
resource "aws_instance" "${sanitizedName}" {
  ami                    = var.${sanitizedName}_ami_id != "" ? var.${sanitizedName}_ami_id : data.aws_ami.${sanitizedName}_ami.id
  instance_type          = var.${sanitizedName}_instance_type
  iam_instance_profile   = aws_iam_instance_profile.${sanitizedName}_profile.name
  key_name               = var.${sanitizedName}_key_name
  ${vpcName ? `subnet_id              = module.${vpcSanitized}_vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.${sanitizedName}_sg.id]` : ''}

  associate_public_ip_address = var.${sanitizedName}_public_ip

  root_block_device {
    volume_size           = ${storage}
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  # Enable detailed monitoring in production
  monitoring = var.environment == "production"

  # Metadata options (IMDSv2)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  user_data = var.${sanitizedName}_user_data

  tags = {
    Name        = "\${var.project_name}-${name}"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }

  lifecycle {
    ignore_changes = [ami]
  }
}

# Elastic IP (optional)
resource "aws_eip" "${sanitizedName}_eip" {
  count = var.${sanitizedName}_allocate_elastic_ip ? 1 : 0

  instance = aws_instance.${sanitizedName}.id
  domain   = "vpc"

  tags = {
    Name        = "\${var.project_name}-${name}-eip"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}`;
}

export function generateEC2Outputs(resource: EC2Resource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');

  return `output "${sanitizedName}_instance_id" {
  description = "EC2 instance ID for ${resource.name}"
  value       = aws_instance.${sanitizedName}.id
}

output "${sanitizedName}_public_ip" {
  description = "Public IP address for ${resource.name}"
  value       = var.${sanitizedName}_allocate_elastic_ip ? try(aws_eip.${sanitizedName}_eip[0].public_ip, null) : aws_instance.${sanitizedName}.public_ip
}

output "${sanitizedName}_private_ip" {
  description = "Private IP address for ${resource.name}"
  value       = aws_instance.${sanitizedName}.private_ip
}`;
}

export function generateEC2Variables(resource: EC2Resource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');
  const { instanceType = 't3.micro' } = resource;

  return `variable "${sanitizedName}_instance_type" {
  description = "EC2 instance type for ${resource.name}"
  type        = string
  default     = "${instanceType}"
}

variable "${sanitizedName}_ami_id" {
  description = "AMI ID for ${resource.name} (leave empty to use latest Amazon Linux 2023)"
  type        = string
  default     = ""
}

variable "${sanitizedName}_key_name" {
  description = "SSH key pair name for ${resource.name}"
  type        = string
  default     = ""
}

variable "${sanitizedName}_public_ip" {
  description = "Associate public IP with ${resource.name}"
  type        = bool
  default     = true
}

variable "${sanitizedName}_allocate_elastic_ip" {
  description = "Allocate Elastic IP for ${resource.name}"
  type        = bool
  default     = false
}

variable "${sanitizedName}_ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access to ${resource.name}"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Restrict in production!
}

variable "${sanitizedName}_user_data" {
  description = "User data script for ${resource.name}"
  type        = string
  default     = ""
}`;
}
