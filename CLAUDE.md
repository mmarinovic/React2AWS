# CLAUDE.md

This file provides guidance to AI coding agents working in this repository.

## Project Overview

**React2AWS** transforms React JSX syntax into production-ready Terraform code for AWS infrastructure. Users write familiar JSX with Tailwind-style className configuration and get complete Terraform projects. The main components are the landing page (marketing), the studio (live editor with preview), and the generator engine (JSX parsing and Terraform generation).

## Development Commands

**Package Management:**

- Use `bun` - never use npm or yarn
- `bun install` - Install dependencies

**Development:**

- `bun run dev` - Run the Next.js dev server (localhost:3000)
- `bun run build` - Build for production
- `bun run start` - Start production server

**Testing:**

- `bun test` - Run unit tests
- `bun test --watch` - Run tests in watch mode
- `bun test --coverage` - Run tests with coverage
- `bun run test:e2e` - Run Playwright E2E tests
- `bun run test:e2e:ui` - Run E2E tests with Playwright UI
- `bun run test:e2e:headed` - Run E2E tests in headed browser

**Code Quality:**

- `bun run lint` - Run ESLint

## Architecture Overview

**Pages:**

- `src/app/page.tsx` - Landing page (Hero, HowItWorks, SupportedResources, Features, CTA)
- `src/app/studio/` - Interactive editor with live Terraform preview

**Core Libraries:**

- `src/lib/generators/` - Terraform generators for each AWS resource (vpc.ts, rds.ts, fargate.ts, lambda.ts, s3.ts, dynamodb.ts, alb.ts, ec2.ts, security-group.ts)
- `src/lib/generators/modules/` - Reusable Terraform module generators
- `src/lib/parser/` - JSX and className parsing (jsx-parser.ts, class-parser.ts)
- `src/lib/autocomplete/` - CodeMirror autocomplete extension and schema
- `src/lib/utils/` - Shared utilities (terraform.ts, resources.ts)
- `src/lib/examples/` - Starter templates (templates.ts)

**Components:**

- `src/components/landing/` - Landing page sections (Hero, Features, SupportedResources, etc.)
- `src/components/studio/` - Studio UI (Editor, Preview, TerraformOutput, SidePanel, layout)

**Testing:**

- `src/__tests__/` - Unit tests (generators, parser, utils)
- `e2e/` - Playwright E2E tests

## Supported AWS Resources

| Component | Generator |
|-----------|-----------|
| `<VPC>` | vpc.ts, vpc-module.ts |
| `<RDS>` | rds.ts, rds-module.ts |
| `<Fargate>` | fargate.ts, fargate-module.ts |
| `<EC2>` | ec2.ts |
| `<Lambda>` | lambda.ts, lambda-module.ts |
| `<S3>` | s3.ts, s3-module.ts |
| `<DynamoDB>` | dynamodb.ts, dynamodb-module.ts |
| `<ALB>` | alb.ts |
| `<SecurityGroup>` | security-group.ts |

## Development Guidelines

**Code Style:**

- No comments - write self-documenting code with clear names
- No TODO/FIXME/HACK - implement fully or discuss first
- Prefix unused variables with `_`

**Project Structure:**

- Never put `components/` or `hooks/` inside `app/` directory
- `app/` is exclusively for Next.js routing (pages, layouts)
- Components go in `src/components/`, organized by feature (landing/, studio/)
- Hooks go in `src/app/studio/hooks/` or create `src/hooks/` for shared hooks
- Pages should be slim - only render components, no business logic

**Testing Standards:**

- Every code change must include corresponding tests
- Unit tests with Bun test for generators, parsers, and utilities
- E2E tests in `/e2e/tests/` using Playwright

## Key Locations

- `/src/app/` - Next.js pages and layouts
- `/src/components/landing/` - Landing page React components
- `/src/components/studio/` - Studio (editor) React components
- `/src/lib/generators/` - Terraform generation logic
- `/src/lib/parser/` - JSX and className parsing
- `/src/__tests__/` - Unit tests
- `/e2e/tests/` - End-to-end Playwright tests
- `/src/lib/examples/templates.ts` - Starter template definitions

## Testing Strategy

**Unit tests:** `src/__tests__/generators/` for Terraform generators, `src/__tests__/parser/` for JSX/class parsing
**E2E tests:** Playwright tests in `/e2e/tests/` for editor, download/share, responsive, and terraform output flows

Run `bun run lint && bun test` before submitting changes.

