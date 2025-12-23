import { FargateResource } from '@/types/aws';

export function generateFargate(resource: FargateResource, vpcName?: string): string {
  const {
    name,
    memory = 512,
    cpu = 256,
    desiredCount = 1,
    port = 80,
  } = resource;

  const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');
  const vpcSanitized = vpcName?.replace(/[^a-zA-Z0-9_]/g, '_') || 'main';

  // Validate and adjust Fargate CPU/Memory combinations
  const validCpuUnits = [256, 512, 1024, 2048, 4096];
  const actualCpuUnits = validCpuUnits.reduce((prev, curr) =>
    Math.abs(curr - cpu) < Math.abs(prev - cpu) ? curr : prev
  );

  // Valid memory for each CPU
  const memoryForCpu: Record<number, number[]> = {
    256: [512, 1024, 2048],
    512: [1024, 2048, 3072, 4096],
    1024: [2048, 3072, 4096, 5120, 6144, 7168, 8192],
    2048: [4096, 5120, 6144, 7168, 8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384],
    4096: [8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384, 17408, 18432, 19456, 20480, 21504, 22528, 23552, 24576, 25600, 26624, 27648, 28672, 29696, 30720],
  };

  const validMemory = memoryForCpu[actualCpuUnits] || [512];
  const actualMemory = validMemory.reduce((prev, curr) =>
    Math.abs(curr - memory) < Math.abs(prev - memory) ? curr : prev
  );

  const securityGroup = vpcName ? `
# Security Group for ${name} Fargate Service
resource "aws_security_group" "${sanitizedName}_fargate_sg" {
  name        = "\${var.project_name}-${name}-fargate-sg"
  description = "Security group for ${name} Fargate service"
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id

  ingress {
    description = "Service port"
    from_port   = ${port}
    to_port     = ${port}
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  ingress {
    description = "Health check"
    from_port   = ${port}
    to_port     = ${port}
    protocol    = "tcp"
    security_groups = [aws_security_group.${sanitizedName}_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${var.project_name}-${name}-fargate-sg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

# ALB Security Group for ${name}
resource "aws_security_group" "${sanitizedName}_alb_sg" {
  name        = "\${var.project_name}-${name}-alb-sg"
  description = "Security group for ${name} ALB"
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

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
    Name        = "\${var.project_name}-${name}-alb-sg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}` : '';

  return `${securityGroup}

# ECS Cluster and Fargate Service using terraform-aws-modules/ecs/aws
# https://registry.terraform.io/modules/terraform-aws-modules/ecs/aws/latest

module "${sanitizedName}_ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "5.11.4"

  cluster_name = "\${var.project_name}-\${var.environment}"

  # Disable default CloudWatch log group (we create our own per service)
  create_cloudwatch_log_group = false

  cluster_settings = [
    {
      name  = "containerInsights"
      value = var.environment == "production" ? "enabled" : "disabled"
    }
  ]

  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 100
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 0
      }
    }
  }

  services = {
    "${name}" = {
      cpu    = ${actualCpuUnits}
      memory = ${actualMemory}

      enable_autoscaling  = var.environment == "production"
      autoscaling_min_capacity = ${desiredCount}
      autoscaling_max_capacity = ${desiredCount * 5}

      runtime_platform = {
        cpu_architecture        = "ARM64"
        operating_system_family = "LINUX"
      }

      # IAM Roles
      tasks_iam_role_name            = "\${var.project_name}-${name}-task-role"
      tasks_iam_role_use_name_prefix = false
      task_exec_iam_role_name        = "\${var.project_name}-${name}-exec-role"
      task_exec_iam_role_use_name_prefix = false

      task_exec_iam_role_policies = {
        ssm_readonly       = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
        ecs_task_execution = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
      }

      # Container Definition
      container_definitions = {
        "${name}" = {
          essential = true
          image     = var.${sanitizedName}_container_image
          
          port_mappings = [
            {
              name          = "${name}"
              containerPort = ${port}
              hostPort      = ${port}
              protocol      = "tcp"
              appProtocol   = "http"
            }
          ]

          readonly_root_filesystem  = false
          enable_cloudwatch_logging = true
          
          cloudwatch_log_group_retention_in_days = 30

          # Secrets from SSM Parameter Store
          secrets = var.${sanitizedName}_secrets

          # Environment variables
          environment = var.${sanitizedName}_environment_variables
        }
      }

      # Load Balancer Configuration${vpcName ? `
      load_balancer = {
        service = {
          target_group_arn = aws_lb_target_group.${sanitizedName}_tg.arn
          container_name   = "${name}"
          container_port   = ${port}
        }
      }

      health_check_grace_period_seconds = 60` : ''}

      # Network Configuration
      subnet_ids = ${vpcName ? `module.${vpcSanitized}_vpc.private_subnets` : 'var.service_subnet_ids'}
      
      security_group_rules = {
        service_ingress = {
          type                     = "ingress"
          from_port                = ${port}
          to_port                  = ${port}
          protocol                 = "tcp"
          description              = "Service port"
          ${vpcName ? `source_security_group_id = aws_security_group.${sanitizedName}_alb_sg.id` : 'cidr_blocks = ["0.0.0.0/0"]'}
        }
        egress_all = {
          type        = "egress"
          from_port   = 0
          to_port     = 0
          protocol    = "-1"
          cidr_blocks = ["0.0.0.0/0"]
        }
      }
    }
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}${vpcName ? `

# Application Load Balancer for ${name}
resource "aws_lb" "${sanitizedName}_alb" {
  name               = "\${var.project_name}-${name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.${sanitizedName}_alb_sg.id]
  subnets            = module.${vpcSanitized}_vpc.public_subnets

  enable_deletion_protection = var.environment == "production"

  tags = {
    Name        = "\${var.project_name}-${name}-alb"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

resource "aws_lb_target_group" "${sanitizedName}_tg" {
  name        = "\${var.project_name}-${name}-tg"
  port        = ${port}
  protocol    = "HTTP"
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200-399"
    path                = var.${sanitizedName}_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name        = "\${var.project_name}-${name}-tg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

resource "aws_lb_listener" "${sanitizedName}_http" {
  load_balancer_arn = aws_lb.${sanitizedName}_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.${sanitizedName}_tg.arn
  }
}` : ''}`;
}

export function generateFargateOutputs(resource: FargateResource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');

  return `output "${sanitizedName}_cluster_arn" {
  description = "ECS Cluster ARN for ${resource.name}"
  value       = module.${sanitizedName}_ecs.cluster_arn
}

output "${sanitizedName}_service_name" {
  description = "ECS Service name for ${resource.name}"
  value       = "${resource.name}"
}

output "${sanitizedName}_alb_dns_name" {
  description = "ALB DNS name for ${resource.name}"
  value       = aws_lb.${sanitizedName}_alb.dns_name
}`;
}

export function generateFargateVariables(resource: FargateResource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');

  return `variable "${sanitizedName}_container_image" {
  description = "Container image for ${resource.name} service"
  type        = string
  default     = "nginx:latest"  # Replace with your ECR image
}

variable "${sanitizedName}_health_check_path" {
  description = "Health check path for ${resource.name} target group"
  type        = string
  default     = "/"
}

variable "${sanitizedName}_secrets" {
  description = "Secrets from SSM Parameter Store for ${resource.name}"
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

variable "${sanitizedName}_environment_variables" {
  description = "Environment variables for ${resource.name}"
  type = list(object({
    name  = string
    value = string
  }))
  default = [
    {
      name  = "ENVIRONMENT"
      value = "production"
    }
  ]
}`;
}
