import { RDSResource } from '@/types/aws';
import { sanitizeName } from '@/lib/utils/terraform';

export function generateRDS(resource: RDSResource, vpcName?: string): string {
  const {
    name,
    engine = 'postgres',
    multiAz = false,
    backupRetention = 7,
    deletionProtection = false,
  } = resource;

  const sanitizedName = sanitizeName(name);
  const vpcSanitized = vpcName ? sanitizeName(vpcName) : 'main';

  const engineConfig: Record<string, { engine: string; family: string; majorVersion: string; port: number }> = {
    'postgres': { engine: 'postgres', family: 'postgres16', majorVersion: '16', port: 5432 },
    'mysql': { engine: 'mysql', family: 'mysql8.0', majorVersion: '8.0', port: 3306 },
    'mariadb': { engine: 'mariadb', family: 'mariadb10.11', majorVersion: '10.11', port: 3306 },
  };

  const config = engineConfig[engine] || engineConfig['postgres'];

  const securityGroup = vpcName ? `
# Security Group for ${name} RDS
resource "aws_security_group" "${sanitizedName}_rds_sg" {
  name        = "\${var.project_name}-${name}-rds-sg"
  description = "Security group for ${name} RDS instance"
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id

  ingress {
    description = "${config.engine} access from VPC"
    from_port   = ${config.port}
    to_port     = ${config.port}
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${var.project_name}-${name}-rds-sg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}` : '';

  return `${securityGroup}

# RDS Module using terraform-aws-modules/rds/aws
# https://registry.terraform.io/modules/terraform-aws-modules/rds/aws/latest

module "${sanitizedName}_rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.10.0"

  identifier = "\${var.project_name}-${name}"

  engine               = "${config.engine}"
  engine_version       = "${config.majorVersion}"
  family               = "${config.family}"
  major_engine_version = "${config.majorVersion}"
  instance_class       = var.${sanitizedName}_instance_class

  allocated_storage     = var.${sanitizedName}_allocated_storage
  max_allocated_storage = var.${sanitizedName}_max_allocated_storage
  storage_type          = "gp3"

  db_name  = "${sanitizedName.replace(/-/g, '_')}"
  username = var.${sanitizedName}_db_username
  port     = ${config.port}

  # Secrets Manager integration - no hardcoded passwords!
  manage_master_user_password                       = true
  manage_master_user_password_rotation              = true
  master_user_password_rotation_automatically_after_days = 30
  master_user_password_rotate_immediately           = false

  # IAM Database Authentication
  iam_database_authentication_enabled = true

  # Network Configuration
  vpc_security_group_ids = ${vpcName ? `[aws_security_group.${sanitizedName}_rds_sg.id]` : '[]'}
  create_db_subnet_group = true
  subnet_ids             = ${vpcName ? `module.${vpcSanitized}_vpc.private_subnets` : 'var.db_subnet_ids'}
  publicly_accessible    = false
  multi_az               = ${multiAz}

  # Backup Configuration
  backup_retention_period = ${backupRetention}
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"
  copy_tags_to_snapshot  = true
  skip_final_snapshot    = var.environment != "production"

  # Performance Insights
  performance_insights_enabled          = var.environment == "production"
  performance_insights_retention_period = 7

  # Enhanced Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.${sanitizedName}_rds_monitoring.arn

  # Database Protection
  deletion_protection = ${deletionProtection} || var.environment == "production"
  apply_immediately   = var.environment != "production"

  # Parameter Group Settings
  parameters = [
    {
      name  = "log_statement"
      value = "all"
    }
  ]

  tags = {
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

# RDS Enhanced Monitoring IAM Role
resource "aws_iam_role" "${sanitizedName}_rds_monitoring" {
  name = "\${var.project_name}-${name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

resource "aws_iam_role_policy_attachment" "${sanitizedName}_rds_monitoring" {
  role       = aws_iam_role.${sanitizedName}_rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}`;
}

export function generateRDSOutputs(resource: RDSResource): string {
  const sanitizedName = sanitizeName(resource.name);

  return `output "${sanitizedName}_rds_endpoint" {
  description = "RDS instance endpoint for ${resource.name}"
  value       = module.${sanitizedName}_rds.db_instance_endpoint
}

output "${sanitizedName}_rds_arn" {
  description = "RDS instance ARN for ${resource.name}"
  value       = module.${sanitizedName}_rds.db_instance_arn
}

output "${sanitizedName}_rds_master_secret_arn" {
  description = "Secret ARN for ${resource.name} master password (stored in AWS Secrets Manager)"
  value       = module.${sanitizedName}_rds.db_instance_master_user_secret_arn
  sensitive   = true
}

output "${sanitizedName}_rds_security_group_id" {
  description = "Security group ID for ${resource.name} RDS"
  value       = aws_security_group.${sanitizedName}_rds_sg.id
}`;
}

export function generateRDSVariables(resource: RDSResource): string {
  const sanitizedName = sanitizeName(resource.name);
  const {
    instanceClass = 'db.t4g.micro',
    storage = 20,
    maxStorage = 100,
  } = resource;

  return `variable "${sanitizedName}_instance_class" {
  description = "RDS instance class for ${resource.name}"
  type        = string
  default     = "${instanceClass}"
}

variable "${sanitizedName}_allocated_storage" {
  description = "Initial allocated storage in GB for ${resource.name}"
  type        = number
  default     = ${storage}
}

variable "${sanitizedName}_max_allocated_storage" {
  description = "Maximum allocated storage for auto-scaling in GB for ${resource.name}"
  type        = number
  default     = ${maxStorage}
}

variable "${sanitizedName}_db_username" {
  description = "Master username for ${resource.name}"
  type        = string
  default     = "admin"
}`;
}
