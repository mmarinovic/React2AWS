import { ALBResource } from '@/types/aws';
import { sanitizeName } from '@/lib/utils/terraform';

export function generateALB(resource: ALBResource, vpcName?: string): string {
  const {
    name,
    internal = false,
  } = resource;

  const sanitizedName = sanitizeName(name);
  const vpcSanitized = vpcName ? sanitizeName(vpcName) : 'main';

  if (!vpcName) {
    return `# ALB "${name}" requires a VPC parent
# Wrap your ALB in a <VPC> component:
#
# <VPC className="cidr-10.0.0.0/16" name="main">
#   <ALB className="public" name="${name}" />
# </VPC>`;
  }

  return `# Application Load Balancer: ${name}

# Security Group for ALB
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
}

# Application Load Balancer
resource "aws_lb" "${sanitizedName}" {
  name               = "\${var.project_name}-${name}"
  internal           = ${internal}
  load_balancer_type = "application"
  security_groups    = [aws_security_group.${sanitizedName}_alb_sg.id]
  subnets            = ${internal ? `module.${vpcSanitized}_vpc.private_subnets` : `module.${vpcSanitized}_vpc.public_subnets`}

  enable_deletion_protection = var.environment == "production"

  # Access logs (optional)
  dynamic "access_logs" {
    for_each = var.${sanitizedName}_access_logs_bucket != "" ? [1] : []
    content {
      bucket  = var.${sanitizedName}_access_logs_bucket
      prefix  = "${name}"
      enabled = true
    }
  }

  tags = {
    Name        = "\${var.project_name}-${name}"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

# Default Target Group
resource "aws_lb_target_group" "${sanitizedName}_tg" {
  name        = "\${var.project_name}-${name}-tg"
  port        = var.${sanitizedName}_target_port
  protocol    = "HTTP"
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id
  target_type = var.${sanitizedName}_target_type

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

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = false
  }

  tags = {
    Name        = "\${var.project_name}-${name}-tg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# HTTP Listener (redirect to HTTPS in production)
resource "aws_lb_listener" "${sanitizedName}_http" {
  load_balancer_arn = aws_lb.${sanitizedName}.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = var.${sanitizedName}_certificate_arn != "" ? "redirect" : "forward"

    dynamic "redirect" {
      for_each = var.${sanitizedName}_certificate_arn != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }

    target_group_arn = var.${sanitizedName}_certificate_arn == "" ? aws_lb_target_group.${sanitizedName}_tg.arn : null
  }
}

# HTTPS Listener (when certificate is provided)
resource "aws_lb_listener" "${sanitizedName}_https" {
  count = var.${sanitizedName}_certificate_arn != "" ? 1 : 0

  load_balancer_arn = aws_lb.${sanitizedName}.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.${sanitizedName}_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.${sanitizedName}_tg.arn
  }
}`;
}

export function generateALBOutputs(resource: ALBResource): string {
  const sanitizedName = sanitizeName(resource.name);

  return `output "${sanitizedName}_alb_arn" {
  description = "ALB ARN for ${resource.name}"
  value       = aws_lb.${sanitizedName}.arn
}

output "${sanitizedName}_alb_dns_name" {
  description = "ALB DNS name for ${resource.name}"
  value       = aws_lb.${sanitizedName}.dns_name
}

output "${sanitizedName}_alb_zone_id" {
  description = "ALB zone ID for ${resource.name}"
  value       = aws_lb.${sanitizedName}.zone_id
}

output "${sanitizedName}_target_group_arn" {
  description = "Target group ARN for ${resource.name}"
  value       = aws_lb_target_group.${sanitizedName}_tg.arn
}

output "${sanitizedName}_alb_security_group_id" {
  description = "ALB security group ID for ${resource.name}"
  value       = aws_security_group.${sanitizedName}_alb_sg.id
}`;
}

export function generateALBVariables(resource: ALBResource): string {
  const sanitizedName = sanitizeName(resource.name);

  return `variable "${sanitizedName}_target_port" {
  description = "Target port for ${resource.name} target group"
  type        = number
  default     = 80
}

variable "${sanitizedName}_target_type" {
  description = "Target type for ${resource.name} target group (instance, ip, lambda)"
  type        = string
  default     = "ip"
}

variable "${sanitizedName}_health_check_path" {
  description = "Health check path for ${resource.name}"
  type        = string
  default     = "/"
}

variable "${sanitizedName}_certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener on ${resource.name}"
  type        = string
  default     = ""
}

variable "${sanitizedName}_access_logs_bucket" {
  description = "S3 bucket for ALB access logs for ${resource.name}"
  type        = string
  default     = ""
}`;
}
