export interface ExampleTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const exampleTemplates: ExampleTemplate[] = [
  {
    id: 'ml-inference-api',
    name: 'AI/ML Inference API',
    description: 'High-memory Fargate, Python Lambdas, S3',
    code: `<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-west-2 single-nat" name="ml-platform">
    <ALB className="public" name="inference-lb" />
    <Fargate className="mem-4gb cpu-2 port-8080 count-3" name="model-server" />
    <Fargate className="mem-2gb cpu-1 port-8080 count-2" name="embedding-service" />
  </VPC>
  <Lambda className="runtime-python3.14 mem-1024mb timeout-60s" name="preprocess" />
  <Lambda className="runtime-python3.14 mem-512mb timeout-30s" name="postprocess" />
  <Lambda className="runtime-python3.14 mem-2048mb timeout-300s" name="batch-inference" />
  <DynamoDB className="on-demand" name="inference-logs" />
  <DynamoDB className="on-demand" name="rate-limits" />
  <S3 className="acl-private versioned encrypted" name="models" />
  <S3 className="acl-private versioned" name="training-data" />
  <S3 className="acl-private versioned encrypted" name="predictions" />
</Infrastructure>`,
  },
  {
    id: 'api-backend',
    name: 'API Backend',
    description: 'VPC, ALB, Fargate, RDS, S3',
    code: `<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-east-1 single-nat" name="main">
    <ALB className="public" name="api-lb" />
    <Fargate className="mem-1gb cpu-0.5 port-8080 count-2" name="api-service" />
    <RDS className="engine-postgres instance-md storage-50gb maxstorage-200gb backup-7d deletion-protection" name="api-db" />
    <S3 className="acl-private versioned encrypted" name="uploads" />
    <S3 className="acl-private encrypted" name="logs" />
  </VPC>
</Infrastructure>`,
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'VPC, Lambda x3, DynamoDB, S3',
    code: `<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-east-1 single-nat" name="data-vpc">
    <Lambda className="runtime-python3.14 mem-2gb timeout-300s" name="data-ingestion" />
    <Lambda className="runtime-python3.14 mem-4gb timeout-900s" name="data-transform" />
    <Lambda className="runtime-python3.14 mem-1gb timeout-60s" name="data-export" />
  </VPC>
  <DynamoDB className="on-demand" name="raw-data" />
  <DynamoDB className="on-demand" name="processed-data" />
  <S3 className="acl-private versioned encrypted" name="data-lake" />
  <S3 className="acl-private encrypted" name="export-bucket" />
</Infrastructure>`,
  },
  {
    id: 'ecommerce-platform',
    name: 'E-commerce Platform',
    description: 'Fargate services, RDS, DynamoDB, Lambda, S3',
    code: `<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-east-1 single-nat" name="ecommerce">
    <ALB className="public" name="storefront-lb" />
    <Fargate className="mem-1gb cpu-0.5 port-3000 count-3" name="storefront" />
    <Fargate className="mem-512mb cpu-0.25 port-3000 count-2" name="cart-service" />
    <Fargate className="mem-1gb cpu-0.5 port-3000 count-2" name="checkout-service" />
    <Fargate className="mem-512mb cpu-0.25 port-3000 count-2" name="inventory-service" />
    <RDS className="engine-postgres instance-lg storage-100gb maxstorage-500gb multi-az backup-14d deletion-protection" name="orders-db" />
  </VPC>
  <DynamoDB className="on-demand" name="cart-cache" />
  <DynamoDB className="on-demand" name="sessions" />
  <Lambda className="runtime-nodejs22 mem-512mb timeout-60s" name="order-processor" />
  <Lambda className="runtime-nodejs22 mem-256mb timeout-30s" name="notification-service" />
  <S3 className="acl-private versioned" name="product-images" />
  <S3 className="acl-private versioned encrypted" name="order-exports" />
</Infrastructure>`,
  },
  {
    id: 'full-stack',
    name: 'Full Stack Application',
    description: 'VPC, EC2, RDS, S3',
    code: `<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-west-2" name="production">
    <EC2 className="instance-t3-medium storage-50gb" name="webserver" />
    <RDS className="engine-postgres instance-lg storage-100gb maxstorage-500gb multi-az backup-14d deletion-protection" name="main-db" />
    <S3 className="acl-private versioned encrypted" name="uploads" />
    <S3 className="acl-private encrypted" name="backups" />
  </VPC>
</Infrastructure>`,
  },
  {
    id: 'microservices',
    name: 'Microservices Architecture',
    description: 'VPC, ALB, Fargate x4, RDS, DynamoDB, S3',
    code: `<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-east-1 single-nat" name="microservices-vpc">
    <ALB className="public" name="api-gateway" />
    <Fargate className="mem-512mb cpu-0.25 port-3000" name="auth-service" />
    <Fargate className="mem-1gb cpu-0.5 port-3000" name="user-service" />
    <Fargate className="mem-2gb cpu-1 port-3000 count-3" name="order-service" />
    <Fargate className="mem-512mb cpu-0.25 port-3000" name="notification-service" />
    <RDS className="engine-postgres instance-lg storage-100gb maxstorage-1tb multi-az backup-7d deletion-protection" name="shared-db" />
    <DynamoDB className="on-demand" name="cache" />
    <S3 className="acl-private encrypted" name="shared-assets" />
  </VPC>
</Infrastructure>`,
  },
  {
    id: 'saas-multitenant',
    name: 'SaaS Multi-tenant Backend',
    description: 'Fargate services, RDS, DynamoDB, Lambda, S3',
    code: `<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-east-1 single-nat" name="saas-platform">
    <ALB className="public" name="api-gateway" />
    <Fargate className="mem-1gb cpu-0.5 port-3000 count-3" name="auth-service" />
    <Fargate className="mem-1gb cpu-0.5 port-3000 count-2" name="billing-service" />
    <Fargate className="mem-2gb cpu-1 port-3000 count-4" name="core-api" />
    <Fargate className="mem-512mb cpu-0.25 port-3000 count-2" name="webhook-service" />
    <RDS className="engine-postgres instance-lg storage-200gb maxstorage-1000gb multi-az backup-14d deletion-protection" name="main-db" />
  </VPC>
  <DynamoDB className="on-demand" name="tenant-config" />
  <DynamoDB className="on-demand" name="feature-flags" />
  <DynamoDB className="on-demand" name="api-keys" />
  <Lambda className="runtime-nodejs22 mem-512mb timeout-300s" name="async-jobs" />
  <Lambda className="runtime-nodejs22 mem-256mb timeout-60s" name="scheduled-tasks" />
  <Lambda className="runtime-python3.14 mem-512mb timeout-120s" name="usage-aggregator" />
  <S3 className="acl-private versioned encrypted" name="tenant-uploads" />
  <S3 className="acl-private versioned encrypted" name="audit-logs" />
</Infrastructure>`,
  },
  {
    id: 'serverless-api',
    name: 'Serverless API',
    description: 'Lambda, DynamoDB, S3',
    code: `<Infrastructure>
  <Lambda className="runtime-nodejs22 mem-512mb timeout-30s" name="api-handler" />
  <Lambda className="runtime-nodejs22 mem-256mb timeout-10s" name="webhook-handler" />
  <Lambda className="runtime-python3.14 mem-1gb timeout-60s" name="data-processor" />
  <DynamoDB className="on-demand" name="api-data" />
  <DynamoDB className="on-demand" name="sessions" />
  <S3 className="acl-private versioned encrypted" name="lambda-artifacts" />
</Infrastructure>`,
  },
];

export function getTemplateById(id: string): ExampleTemplate | undefined {
  return exampleTemplates.find(t => t.id === id);
}

export const defaultTemplate = exampleTemplates[0]; // AI/ML Inference API
