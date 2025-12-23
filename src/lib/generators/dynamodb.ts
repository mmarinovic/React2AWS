import { DynamoDBResource } from '@/types/aws';

export function generateDynamoDB(resource: DynamoDBResource): string {
  const {
    name,
    billingMode = 'PAY_PER_REQUEST',
  } = resource;

  const sanitizedName = name.replace(/[^a-zA-Z0-9_]/g, '_');

  const provisionedConfig = billingMode === 'PROVISIONED' ? `
  read_capacity  = var.${sanitizedName}_read_capacity
  write_capacity = var.${sanitizedName}_write_capacity` : '';

  const autoscalingConfig = billingMode === 'PROVISIONED' ? `
# Auto Scaling for ${name} DynamoDB Table
resource "aws_appautoscaling_target" "${sanitizedName}_read_target" {
  max_capacity       = var.${sanitizedName}_max_read_capacity
  min_capacity       = var.${sanitizedName}_read_capacity
  resource_id        = "table/\${aws_dynamodb_table.${sanitizedName}.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "${sanitizedName}_read_policy" {
  name               = "\${var.project_name}-${name}-read-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.${sanitizedName}_read_target.resource_id
  scalable_dimension = aws_appautoscaling_target.${sanitizedName}_read_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.${sanitizedName}_read_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBReadCapacityUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_appautoscaling_target" "${sanitizedName}_write_target" {
  max_capacity       = var.${sanitizedName}_max_write_capacity
  min_capacity       = var.${sanitizedName}_write_capacity
  resource_id        = "table/\${aws_dynamodb_table.${sanitizedName}.name}"
  scalable_dimension = "dynamodb:table:WriteCapacityUnits"
  service_namespace  = "dynamodb"
}

resource "aws_appautoscaling_policy" "${sanitizedName}_write_policy" {
  name               = "\${var.project_name}-${name}-write-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.${sanitizedName}_write_target.resource_id
  scalable_dimension = aws_appautoscaling_target.${sanitizedName}_write_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.${sanitizedName}_write_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "DynamoDBWriteCapacityUtilization"
    }
    target_value = 70.0
  }
}` : '';

  return `# DynamoDB Table: ${name}
resource "aws_dynamodb_table" "${sanitizedName}" {
  name         = "\${var.project_name}-${name}-\${var.environment}"
  billing_mode = "${billingMode}"${provisionedConfig}
  hash_key     = var.${sanitizedName}_hash_key
  range_key    = var.${sanitizedName}_range_key

  attribute {
    name = var.${sanitizedName}_hash_key
    type = "S"
  }

  dynamic "attribute" {
    for_each = var.${sanitizedName}_range_key != null ? [1] : []
    content {
      name = var.${sanitizedName}_range_key
      type = "S"
    }
  }

  # Enable TTL for automatic item expiration
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  # Point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  # Stream for change data capture (optional)
  stream_enabled   = var.${sanitizedName}_enable_streams
  stream_view_type = var.${sanitizedName}_enable_streams ? "NEW_AND_OLD_IMAGES" : null

  tags = {
    Name        = "\${var.project_name}-${name}"
    Environment = var.environment
    ManagedBy   = "React2AWS"
  }
}
${autoscalingConfig}`;
}

export function generateDynamoDBOutputs(resource: DynamoDBResource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');

  return `output "${sanitizedName}_table_name" {
  description = "DynamoDB table name for ${resource.name}"
  value       = aws_dynamodb_table.${sanitizedName}.name
}

output "${sanitizedName}_table_arn" {
  description = "DynamoDB table ARN for ${resource.name}"
  value       = aws_dynamodb_table.${sanitizedName}.arn
}

output "${sanitizedName}_stream_arn" {
  description = "DynamoDB stream ARN for ${resource.name}"
  value       = aws_dynamodb_table.${sanitizedName}.stream_arn
}`;
}

export function generateDynamoDBVariables(resource: DynamoDBResource): string {
  const sanitizedName = resource.name.replace(/[^a-zA-Z0-9_]/g, '_');
  const isProvisioned = resource.billingMode === 'PROVISIONED';

  return `variable "${sanitizedName}_hash_key" {
  description = "Hash key (partition key) for ${resource.name}"
  type        = string
  default     = "id"
}

variable "${sanitizedName}_range_key" {
  description = "Range key (sort key) for ${resource.name}"
  type        = string
  default     = null
}

variable "${sanitizedName}_enable_streams" {
  description = "Enable DynamoDB Streams for ${resource.name}"
  type        = bool
  default     = false
}${isProvisioned ? `

variable "${sanitizedName}_read_capacity" {
  description = "Read capacity units for ${resource.name}"
  type        = number
  default     = 5
}

variable "${sanitizedName}_write_capacity" {
  description = "Write capacity units for ${resource.name}"
  type        = number
  default     = 5
}

variable "${sanitizedName}_max_read_capacity" {
  description = "Maximum read capacity units for auto-scaling ${resource.name}"
  type        = number
  default     = 100
}

variable "${sanitizedName}_max_write_capacity" {
  description = "Maximum write capacity units for auto-scaling ${resource.name}"
  type        = number
  default     = 100
}` : ''}`;
}
