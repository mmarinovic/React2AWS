import { LambdaResource } from '@/types/aws';
import { sanitizeName } from '@/lib/utils/terraform';

export function generateLambda(resource: LambdaResource, vpcName?: string): string {
  const {
    name,
    runtime = 'nodejs22.x',
    memory = 128,
    timeout = 30,
  } = resource;

  const sanitizedName = sanitizeName(name);
  const vpcSanitized = vpcName ? sanitizeName(vpcName) : undefined;

  const runtimeMap: Record<string, string> = {
    'nodejs24': 'nodejs24.x',
    'nodejs22': 'nodejs22.x',
    'nodejs20': 'nodejs20.x',
    'python3': 'python3.14',
    'python3.14': 'python3.14',
    'python3.13': 'python3.13',
    'python3.12': 'python3.12',
    'python3.11': 'python3.11',
    'java21': 'java21',
    'java17': 'java17',
    'go': 'provided.al2023',
    'rust': 'provided.al2023',
    'ruby3': 'ruby3.3',
  };

  const actualRuntime = runtimeMap[runtime] || runtime;

  const securityGroup = vpcName ? `
# Security Group for ${name} Lambda
resource "aws_security_group" "${sanitizedName}_lambda_sg" {
  name        = "\${var.project_name}-${name}-lambda-sg"
  description = "Security group for ${name} Lambda function"
  vpc_id      = module.${vpcSanitized}_vpc.vpc_id

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${var.project_name}-${name}-lambda-sg"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}
` : '';

  const vpcConfig = vpcName ? `
  vpc_config {
    subnet_ids         = module.${vpcSanitized}_vpc.private_subnets
    security_group_ids = [aws_security_group.${sanitizedName}_lambda_sg.id]
  }
` : '';

  const vpcDependsOn = vpcName ? `
    aws_security_group.${sanitizedName}_lambda_sg,` : '';

  return `# Lambda Function: ${name}
${securityGroup}
# IAM Role for Lambda
resource "aws_iam_role" "${sanitizedName}_role" {
  name = "\${var.project_name}-${name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "\${var.project_name}-${name}-lambda-role"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

resource "aws_iam_role_policy_attachment" "${sanitizedName}_basic" {
  role       = aws_iam_role.${sanitizedName}_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "${sanitizedName}_vpc" {
  role       = aws_iam_role.${sanitizedName}_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# IAM Policy for cross-resource access (DynamoDB, S3, RDS, Secrets Manager)
resource "aws_iam_role_policy" "${sanitizedName}_resource_access" {
  name = "\${var.project_name}-${name}-resource-access"
  role = aws_iam_role.${sanitizedName}_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      # DynamoDB access
      length(var.${sanitizedName}_dynamodb_table_arns) > 0 ? [
        {
          Effect = "Allow"
          Action = [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:BatchGetItem",
            "dynamodb:BatchWriteItem"
          ]
          Resource = concat(
            var.${sanitizedName}_dynamodb_table_arns,
            [for arn in var.${sanitizedName}_dynamodb_table_arns : "\${arn}/index/*"]
          )
        }
      ] : [],
      # S3 access
      length(var.${sanitizedName}_s3_bucket_arns) > 0 ? [
        {
          Effect = "Allow"
          Action = [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:ListBucket"
          ]
          Resource = concat(
            var.${sanitizedName}_s3_bucket_arns,
            [for arn in var.${sanitizedName}_s3_bucket_arns : "\${arn}/*"]
          )
        }
      ] : [],
      # RDS IAM authentication
      length(var.${sanitizedName}_rds_resource_ids) > 0 ? [
        {
          Effect   = "Allow"
          Action   = ["rds-db:connect"]
          Resource = var.${sanitizedName}_rds_resource_ids
        }
      ] : [],
      # Secrets Manager access (for RDS passwords, API keys, etc.)
      length(var.${sanitizedName}_secrets_arns) > 0 ? [
        {
          Effect   = "Allow"
          Action   = ["secretsmanager:GetSecretValue"]
          Resource = var.${sanitizedName}_secrets_arns
        }
      ] : []
    )
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "${sanitizedName}_logs" {
  name              = "/aws/lambda/\${var.project_name}-${name}"
  retention_in_days = var.${sanitizedName}_log_retention_days

  tags = {
    Name        = "\${var.project_name}-${name}-logs"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

# Lambda Function
resource "aws_lambda_function" "${sanitizedName}" {
  function_name = "\${var.project_name}-${name}"
  role          = aws_iam_role.${sanitizedName}_role.arn
  handler       = var.${sanitizedName}_handler
  runtime       = "${actualRuntime}"

  filename         = var.${sanitizedName}_source_path
  source_code_hash = filebase64sha256(var.${sanitizedName}_source_path)

  memory_size = ${memory}
  timeout     = ${timeout}

  # Reserved concurrency (optional, set to -1 to disable)
  reserved_concurrent_executions = var.${sanitizedName}_reserved_concurrency

  environment {
    variables = merge(
      {
        ENVIRONMENT = var.environment
      },
      var.${sanitizedName}_environment_variables
    )
  }

  # Enable X-Ray tracing
  tracing_config {
    mode = var.environment == "production" ? "Active" : "PassThrough"
  }
${vpcConfig}
  depends_on = [
    aws_iam_role_policy_attachment.${sanitizedName}_basic,
    aws_cloudwatch_log_group.${sanitizedName}_logs,${vpcDependsOn}
  ]

  tags = {
    Name        = "\${var.project_name}-${name}"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}

# Lambda Function URL (optional, for HTTP access without API Gateway)
resource "aws_lambda_function_url" "${sanitizedName}_url" {
  count = var.${sanitizedName}_enable_function_url ? 1 : 0

  function_name      = aws_lambda_function.${sanitizedName}.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    max_age           = 86400
  }
}`;
}

export function generateLambdaOutputs(resource: LambdaResource): string {
  const sanitizedName = sanitizeName(resource.name);

  return `output "${sanitizedName}_function_arn" {
  description = "Lambda function ARN for ${resource.name}"
  value       = aws_lambda_function.${sanitizedName}.arn
}

output "${sanitizedName}_function_name" {
  description = "Lambda function name for ${resource.name}"
  value       = aws_lambda_function.${sanitizedName}.function_name
}

output "${sanitizedName}_function_url" {
  description = "Lambda function URL for ${resource.name}"
  value       = try(aws_lambda_function_url.${sanitizedName}_url[0].function_url, null)
}`;
}

export function generateLambdaVariables(resource: LambdaResource): string {
  const sanitizedName = sanitizeName(resource.name);

  return `variable "${sanitizedName}_source_path" {
  description = "Path to the Lambda deployment package for ${resource.name}"
  type        = string
  default     = "lambda/${resource.name}.zip"
}

variable "${sanitizedName}_handler" {
  description = "Lambda handler for ${resource.name}"
  type        = string
  default     = "index.handler"
}

variable "${sanitizedName}_log_retention_days" {
  description = "CloudWatch log retention in days for ${resource.name}"
  type        = number
  default     = 14
}

variable "${sanitizedName}_reserved_concurrency" {
  description = "Reserved concurrent executions for ${resource.name} (-1 to disable)"
  type        = number
  default     = -1
}

variable "${sanitizedName}_enable_function_url" {
  description = "Enable Lambda function URL for ${resource.name}"
  type        = bool
  default     = false
}

variable "${sanitizedName}_environment_variables" {
  description = "Environment variables for ${resource.name}"
  type        = map(string)
  default     = {}
}

# Cross-resource access variables
variable "${sanitizedName}_dynamodb_table_arns" {
  description = "DynamoDB table ARNs that ${resource.name} Lambda can access"
  type        = list(string)
  default     = []
}

variable "${sanitizedName}_s3_bucket_arns" {
  description = "S3 bucket ARNs that ${resource.name} Lambda can access"
  type        = list(string)
  default     = []
}

variable "${sanitizedName}_rds_resource_ids" {
  description = "RDS resource IDs for IAM auth (format: arn:aws:rds-db:region:account:dbuser:resource-id/user)"
  type        = list(string)
  default     = []
}

variable "${sanitizedName}_secrets_arns" {
  description = "Secrets Manager ARNs that ${resource.name} Lambda can access"
  type        = list(string)
  default     = []
}`;
}
