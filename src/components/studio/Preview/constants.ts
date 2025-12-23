import {
  Database,
  Container,
  Server,
  HardDrive,
  Zap,
  Table,
  Network,
  Globe,
  Shield,
} from 'lucide-react';

export const resourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  RDS: Database,
  Fargate: Container,
  EC2: Server,
  S3: HardDrive,
  Lambda: Zap,
  DynamoDB: Table,
  VPC: Network,
  ALB: Globe,
  SecurityGroup: Shield,
};

export const resourceColors: Record<string, { bg: string; border: string; text: string }> = {
  RDS: { bg: 'bg-blue-950/50', border: 'border-blue-800', text: 'text-blue-400' },
  Fargate: { bg: 'bg-orange-950/50', border: 'border-orange-800', text: 'text-orange-400' },
  EC2: { bg: 'bg-amber-950/50', border: 'border-amber-800', text: 'text-amber-400' },
  S3: { bg: 'bg-green-950/50', border: 'border-green-800', text: 'text-green-400' },
  Lambda: { bg: 'bg-purple-950/50', border: 'border-purple-800', text: 'text-purple-400' },
  DynamoDB: { bg: 'bg-indigo-950/50', border: 'border-indigo-800', text: 'text-indigo-400' },
  VPC: { bg: 'bg-slate-800/50', border: 'border-slate-600', text: 'text-slate-400' },
  ALB: { bg: 'bg-pink-950/50', border: 'border-pink-800', text: 'text-pink-400' },
  SecurityGroup: { bg: 'bg-red-950/50', border: 'border-red-800', text: 'text-red-400' },
};

export const defaultColors = { bg: 'bg-slate-800/50', border: 'border-slate-700', text: 'text-slate-400' };
