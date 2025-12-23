<p align="center">
  <img src="public/banner.svg" alt="React2AWS" width="600" />
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js 16" /></a>
  <a href="https://react2aws.xyz"><img src="https://img.shields.io/badge/demo-live-brightgreen.svg" alt="Live Demo" /></a>
</p>

---

Ever wished you could define your cloud infrastructure the same way you build UIs? React2AWS transforms familiar JSX syntax into production-ready Terraform code.

```jsx
<Infrastructure>
  <VPC className="cidr-10.0.0.0/16 region-us-east-1 single-nat" name="production">
    <ALB className="public" name="api-lb" />
    <Fargate className="mem-1gb cpu-0.5 port-8080 count-2" name="api" />
    <RDS className="engine-postgres instance-lg storage-100gb multi-az" name="db" />
  </VPC>
</Infrastructure>
```

That's it. That's your entire backend infrastructure. No YAML indentation nightmares. No 500-line Terraform files. Just components.

## Why?

Because infrastructure shouldn't feel like deciphering ancient scrolls.

- **You already know JSX** - If you can build a React app, you can define infrastructure
- **Visual hierarchy** - Nested components show relationships at a glance
- **className as config** - Familiar pattern, new superpowers
- **Instant feedback** - See your infrastructure preview as you type

## Features

| | |
|---|---|
| **Live Editor** | Write JSX with syntax highlighting and autocomplete |
| **Real-time Preview** | Visualize your AWS resources instantly |
| **Terraform Generation** | Get production-ready `.tf` files |
| **One-click Export** | Download everything as a ZIP |
| **8 Starter Templates** | From serverless APIs to microservices |

## Supported AWS Resources

| Component | What it creates |
|-----------|-----------------|
| `<VPC>` | Virtual Private Cloud with subnets, NAT, routing |
| `<RDS>` | PostgreSQL, MySQL, or MariaDB databases |
| `<Fargate>` | Containerized services on ECS |
| `<EC2>` | Virtual servers |
| `<Lambda>` | Serverless functions |
| `<S3>` | Object storage buckets |
| `<DynamoDB>` | NoSQL tables |
| `<ALB>` | Application Load Balancers |
| `<SecurityGroup>` | Network access rules |

## How the Syntax Works

Inspired by [Tailwind CSS](https://tailwindcss.com), configuration lives in `className` using a `prefix-value` pattern:

```jsx
// Database with PostgreSQL, large instance, 100GB storage, multi-AZ enabled
<RDS className="engine-postgres instance-lg storage-100gb multi-az" name="api-db" />

// Lambda function with Python 3.14, 512MB memory, 30s timeout
<Lambda className="runtime-python3.14 mem-512mb timeout-30s" name="processor" />

// S3 bucket with versioning and encryption
<S3 className="versioning encryption-aes256" name="assets" />
```

Nest resources inside a VPC to create proper network topology:

```jsx
<VPC className="cidr-10.0.0.0/16 region-us-west-2" name="prod">
  <Fargate className="mem-2gb cpu-1 port-3000" name="web" />
  <RDS className="engine-mysql instance-md" name="data" />
</VPC>
```

## Starter Templates

Get started quickly with pre-built architectures:

| Template | Description |
|----------|-------------|
| **AI/ML Inference API** | High-memory Fargate, Python Lambdas, S3 for ML workloads |
| **API Backend** | VPC, ALB, Fargate, RDS, S3 |
| **Microservices** | Multiple Fargate services with shared database |
| **E-commerce Platform** | Full stack with multiple services and storage |
| **SaaS Multi-tenant** | Scalable backend with proper isolation |
| **Serverless API** | Lambda-based with DynamoDB and S3 |
| **Data Pipeline** | Event-driven Lambda processing with S3 data lake |
| **Full Stack Application** | VPC, EC2, RDS, S3 |

## Generated Output

React2AWS generates a complete Terraform project with modular structure:

```
terraform/
├── main.tf              # Provider and module configuration
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── backend.tf           # Remote state configuration
├── terraform.tfvars     # Variable values
└── modules/
    ├── vpc/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── rds/
    ├── fargate/
    ├── lambda/
    ├── s3/
    └── dynamodb/
```

## Get Started

**[Open react2aws.xyz](https://react2aws.xyz)** and start building your infrastructure.

## License

MIT License
