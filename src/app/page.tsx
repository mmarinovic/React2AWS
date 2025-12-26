import Link from 'next/link';
import {
  ArrowRight,
  Code,
  Zap,
  Layers,
  Database,
  Container,
  Globe,
  Server,
  CheckCircle,
} from 'lucide-react';
import { AnimatedCodePreview } from '@/components/landing/AnimatedCodePreview';
import { SyntaxHighlight } from '@/components/landing/SyntaxHighlight';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Dark */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center">
            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AWS infrastructure as <br /> {' '}
              <span className="inline-flex items-baseline">
                <span className="text-orange-400">&lt;</span>
                <span>React</span>
                <span className="text-orange-400">/&gt;</span>
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Write JSX with Tailwind CSS-inspired className config. Generate Terraform.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/studio"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                Open Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/mmarinovic/React2AWS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
              >
                View on GitHub
              </a>
            </div>

            {/* Animated Code Preview */}
            <AnimatedCodePreview />
          </div>
        </div>
      </section>

      {/* How It Works - Light */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-slate-600">Three simple steps from JSX to deployed infrastructure</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Write JSX',
                description: 'Define your infrastructure using familiar React component syntax. Use className attributes with Tailwind-inspired prefixes.',
                icon: Code,
                color: 'bg-orange-100 text-orange-600',
              },
              {
                step: '02',
                title: 'Configure with className',
                description: 'Set resource properties using intuitive prefix-value pairs like engine-postgres, mem-2gb, or multi-az.',
                icon: Layers,
                color: 'bg-purple-100 text-purple-600',
              },
              {
                step: '03',
                title: 'Generate Terraform',
                description: 'Get production-ready Terraform files with best practices baked in. Download and deploy to AWS.',
                icon: Zap,
                color: 'bg-green-100 text-green-600',
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Resources - Dark */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Supported AWS Resources</h2>
            <p className="mt-4 text-slate-400">All the building blocks you need for modern cloud architecture</p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'VPC', desc: 'Virtual Private Cloud with subnets, NAT, and routing', icon: Globe, color: 'text-slate-400' },
              { name: 'RDS', desc: 'PostgreSQL, MySQL, MariaDB with Multi-AZ support', icon: Database, color: 'text-blue-400' },
              { name: 'Fargate', desc: 'Serverless containers with ECS orchestration', icon: Container, color: 'text-orange-400' },
              { name: 'Lambda', desc: 'Serverless functions with multiple runtimes', icon: Zap, color: 'text-purple-400' },
              { name: 'S3', desc: 'Object storage with versioning and encryption', icon: Server, color: 'text-green-400' },
              { name: 'DynamoDB', desc: 'NoSQL database with on-demand scaling', icon: Database, color: 'text-indigo-400' },
            ].map((resource) => (
              <div
                key={resource.name}
                className="flex items-start gap-4 rounded-lg border border-slate-800 bg-slate-800/50 p-4"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 ${resource.color}`}>
                  <resource.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{resource.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{resource.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syntax Examples - Light */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Intuitive Syntax</h2>
            <p className="mt-4 text-slate-600">Configuration that feels natural to React developers</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[
              {
                title: 'Database Configuration',
                code: '<RDS className="engine-postgres instance-lg storage-100gb multi-az backup-14d" name="main-db" />',
              },
              {
                title: 'Container Service',
                code: '<Fargate className="mem-2gb cpu-1 port-8080 count-3" name="api-service" />',
              },
              {
                title: 'Serverless Function',
                code: '<Lambda className="runtime-nodejs22 mem-512mb timeout-30s" name="handler" />',
              },
              {
                title: 'Object Storage',
                code: '<S3 className="acl-private versioned encrypted" name="uploads" />',
              },
            ].map((example) => (
              <div key={example.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-sm font-medium text-slate-500">{example.title}</div>
                <SyntaxHighlight code={example.code} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Dark */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Built for Developers</h2>
            <p className="mt-4 text-slate-400">Everything you need to ship infrastructure faster</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Real-time Preview', desc: 'See your infrastructure as you type' },
              { title: 'Autocomplete', desc: 'Smart suggestions for components and options' },
              { title: 'Best Practices', desc: 'Terraform modules with security built-in' },
              { title: 'Share via URL', desc: 'Collaborate by sharing configuration links' },
              { title: 'Download as ZIP', desc: 'Get all Terraform files in one click' },
              { title: 'Zero Setup', desc: 'No installation required, works in browser' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <h3 className="font-medium text-white">{feature.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Light */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">Ready to build?</h2>
          <p className="mt-4 text-slate-600">
            Start defining your AWS infrastructure with React components today.
          </p>
          <div className="mt-8">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Open Infrastructure Studio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Dark */}
      <footer className="bg-slate-900 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-500">
                <span className="text-xs font-bold text-white">R2</span>
              </div>
              <span className="font-medium text-white">React2AWS</span>
            </div>
            <p className="text-sm text-slate-500">
              Build AWS infrastructure the React way
            </p>
            <a
              href="https://github.com/mmarinovic/React2AWS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
