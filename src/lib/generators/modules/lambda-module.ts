import { ModuleFiles } from '@/types/aws';

export function generateLambdaModule(): ModuleFiles {
  const mainTf = `locals {
  function_name = "\${var.project_name}-\${var.name}-\${var.environment}"
}

resource "aws_iam_role" "lambda" {
  name = "\${local.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "\${local.function_name}-role"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  count      = var.vpc_config != null ? 1 : 0
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "s3_access" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0
  name  = "\${local.function_name}-s3-access"
  role  = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ]
      Resource = concat(
        var.s3_bucket_arns,
        [for arn in var.s3_bucket_arns : "\${arn}/*"]
      )
    }]
  })
}

resource "aws_iam_role_policy" "dynamodb_access" {
  count = length(var.dynamodb_table_arns) > 0 ? 1 : 0
  name  = "\${local.function_name}-dynamodb-access"
  role  = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
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
        var.dynamodb_table_arns,
        [for arn in var.dynamodb_table_arns : "\${arn}/index/*"]
      )
    }]
  })
}

resource "aws_iam_role_policy" "secrets_access" {
  count = length(var.secrets_arns) > 0 ? 1 : 0
  name  = "\${local.function_name}-secrets-access"
  role  = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = var.secrets_arns
    }]
  })
}

resource "aws_security_group" "lambda" {
  count       = var.vpc_config != null ? 1 : 0
  name        = "\${local.function_name}-sg"
  description = "Security group for \${local.function_name}"
  vpc_id      = var.vpc_config.vpc_id

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "\${local.function_name}-sg"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/\${local.function_name}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "\${local.function_name}-logs"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "\${path.module}/placeholder.zip"

  source {
    content  = "exports.handler = async (event) => { return { statusCode: 200, body: 'Placeholder - deploy your code' }; };"
    filename = "index.js"
  }
}

resource "aws_lambda_function" "this" {
  function_name = local.function_name
  role          = aws_iam_role.lambda.arn
  handler       = var.handler
  runtime       = var.runtime

  filename         = coalesce(var.source_path, data.archive_file.placeholder.output_path)
  source_code_hash = var.source_path != null ? filebase64sha256(var.source_path) : data.archive_file.placeholder.output_base64sha256

  memory_size = var.memory_size
  timeout     = var.timeout

  reserved_concurrent_executions = var.reserved_concurrency

  environment {
    variables = merge(
      {
        ENVIRONMENT = var.environment
      },
      var.environment_variables
    )
  }

  tracing_config {
    mode = var.environment == "production" ? "Active" : "PassThrough"
  }

  dynamic "vpc_config" {
    for_each = var.vpc_config != null ? [var.vpc_config] : []
    content {
      subnet_ids         = vpc_config.value.subnet_ids
      security_group_ids = [aws_security_group.lambda[0].id]
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.lambda,
  ]

  tags = {
    Name        = local.function_name
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
    Generator   = "React2AWS"
  }
}

resource "aws_lambda_function_url" "this" {
  count = var.enable_function_url ? 1 : 0

  function_name      = aws_lambda_function.this.function_name
  authorization_type = var.function_url_auth_type

  cors {
    allow_credentials = var.function_url_cors.allow_credentials
    allow_origins     = var.function_url_cors.allow_origins
    allow_methods     = var.function_url_cors.allow_methods
    allow_headers     = var.function_url_cors.allow_headers
    max_age           = var.function_url_cors.max_age
  }
}`;

  const variablesTf = `variable "name" {
  description = "Name identifier for this Lambda function"
  type        = string
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs20.x"
}

variable "handler" {
  description = "Lambda handler"
  type        = string
  default     = "index.handler"
}

variable "memory_size" {
  description = "Memory size in MB"
  type        = number
  default     = 128
}

variable "timeout" {
  description = "Timeout in seconds"
  type        = number
  default     = 30
}

variable "source_path" {
  description = "Path to Lambda deployment package (optional, uses placeholder if not set)"
  type        = string
  default     = null
}

variable "vpc_config" {
  description = "VPC configuration for Lambda"
  type = object({
    vpc_id     = string
    subnet_ids = list(string)
  })
  default = null
}

variable "environment_variables" {
  description = "Environment variables for the function"
  type        = map(string)
  default     = {}
}

variable "s3_bucket_arns" {
  description = "S3 bucket ARNs this Lambda can access"
  type        = list(string)
  default     = []
}

variable "dynamodb_table_arns" {
  description = "DynamoDB table ARNs this Lambda can access"
  type        = list(string)
  default     = []
}

variable "secrets_arns" {
  description = "Secrets Manager ARNs this Lambda can access"
  type        = list(string)
  default     = []
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

variable "reserved_concurrency" {
  description = "Reserved concurrent executions (-1 for unreserved)"
  type        = number
  default     = -1
}

variable "enable_function_url" {
  description = "Enable Lambda function URL (WARNING: publicly accessible endpoint)"
  type        = bool
  default     = false
}

variable "function_url_auth_type" {
  description = "Authorization type for function URL (NONE or AWS_IAM)"
  type        = string
  default     = "AWS_IAM"

  validation {
    condition     = contains(["NONE", "AWS_IAM"], var.function_url_auth_type)
    error_message = "Authorization type must be NONE or AWS_IAM."
  }
}

variable "function_url_cors" {
  description = "CORS configuration for function URL"
  type = object({
    allow_credentials = optional(bool, false)
    allow_origins     = optional(list(string), [])
    allow_methods     = optional(list(string), ["GET", "POST"])
    allow_headers     = optional(list(string), ["content-type"])
    max_age           = optional(number, 0)
  })
  default = {}
}`;

  const outputsTf = `output "function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.this.function_name
}

output "function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.this.arn
}

output "invoke_arn" {
  description = "Lambda invoke ARN"
  value       = aws_lambda_function.this.invoke_arn
}

output "function_url" {
  description = "Lambda function URL (if enabled)"
  value       = try(aws_lambda_function_url.this[0].function_url, null)
}

output "role_arn" {
  description = "IAM role ARN"
  value       = aws_iam_role.lambda.arn
}

output "role_name" {
  description = "IAM role name"
  value       = aws_iam_role.lambda.name
}

output "security_group_id" {
  description = "Security group ID (if VPC enabled)"
  value       = try(aws_security_group.lambda[0].id, null)
}

output "log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.lambda.name
}`;

  return { mainTf, variablesTf, outputsTf };
}
