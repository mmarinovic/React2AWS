import { Database, Container, Globe, Zap, Server, HardDrive } from 'lucide-react';

const resources = [
  {
    name: 'VPC',
    desc: 'Virtual Private Cloud with subnets, NAT, and routing',
    icon: Globe,
    gradient: 'from-slate-500/20 to-slate-600/10',
    iconColor: 'text-slate-400',
  },
  {
    name: 'RDS',
    desc: 'PostgreSQL, MySQL, MariaDB with Multi-AZ support',
    icon: Database,
    gradient: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
  },
  {
    name: 'Fargate',
    desc: 'Serverless containers with ECS orchestration',
    icon: Container,
    gradient: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
  },
  {
    name: 'Lambda',
    desc: 'Serverless functions with multiple runtimes',
    icon: Zap,
    gradient: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-400',
  },
  {
    name: 'S3',
    desc: 'Object storage with versioning and encryption',
    icon: Server,
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-400',
  },
  {
    name: 'DynamoDB',
    desc: 'NoSQL database with on-demand scaling',
    icon: HardDrive,
    gradient: 'from-indigo-500/20 to-indigo-600/10',
    iconColor: 'text-indigo-400',
  },
];

export function SupportedResources() {
  return (
    <section className="relative bg-surface py-24 lg:py-32">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dense opacity-30" />
      <div className="pointer-events-none absolute inset-0 gradient-radial-center" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Supported Resources</h2>
          <p className="mt-4 text-lg text-muted">All the building blocks for modern cloud architecture</p>
        </div>

        {/* Bento grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <div
              key={resource.name}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:border-accent/30 hover:bg-surface-elevated ${
                index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Gradient background on hover */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${resource.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface transition-colors duration-300 group-hover:border-accent/20 ${resource.iconColor}`}>
                    <resource.icon className="h-6 w-6" />
                  </div>
                  {/* AWS-style tag */}
                  <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                    AWS
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-foreground">{resource.name}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{resource.desc}</p>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* More coming note */}
        <p className="mt-8 text-center text-sm text-muted">
          More resources coming soon: EKS, ElastiCache, SQS, SNS, and more
        </p>
      </div>
    </section>
  );
}
