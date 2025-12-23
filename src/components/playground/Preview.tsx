'use client';

import { useEffect, useState } from 'react';
import { AWSResource } from '@/types/aws';
import {
  Database,
  Container,
  Server,
  HardDrive,
  Zap,
  Table,
  Network,
  Globe,
  Box,
  Shield
} from 'lucide-react';

interface PreviewProps {
  resources: AWSResource[];
}

const resourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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

const resourceColors: Record<string, { bg: string; border: string; text: string }> = {
  RDS: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  Fargate: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
  EC2: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  S3: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
  Lambda: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  DynamoDB: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  VPC: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-600' },
  ALB: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
  SecurityGroup: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
};

function ResourceCard({ resource, index }: { resource: AWSResource; index: number }) {
  const Icon = resourceIcons[resource.type] || Box;
  const colors = resourceColors[resource.type] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600' };
  const animationDelay = `${index * 50}ms`;

  // VPC container
  if (resource.type === 'VPC' && resource.children && resource.children.length > 0) {
    return (
      <div
        className="animate-fade-in-up rounded-lg border border-slate-200 bg-slate-50/50"
        style={{ animationDelay }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
          <Network className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{resource.name}</span>
          {'cidr' in resource && resource.cidr && (
            <span className="text-xs text-slate-400">{resource.cidr}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 p-2">
          {resource.children.map((child, i) => (
            <ResourceCard key={`${child.type}-${child.name}-${i}`} resource={child} index={i} />
          ))}
        </div>
      </div>
    );
  }

  // Regular resource card
  return (
    <div
      className={`animate-fade-in-up flex items-center gap-2 rounded-md border ${colors.bg} ${colors.border} px-3 py-2`}
      style={{ animationDelay }}
    >
      <Icon className={`h-4 w-4 shrink-0 ${colors.text}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-800 truncate">{resource.name}</div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>{resource.type}</span>
          {resource.type === 'Lambda' && resource.runtime && (
            <span className="text-purple-600">• {resource.runtime}</span>
          )}
          {resource.type === 'RDS' && resource.engine && (
            <span className="text-blue-600">• {resource.engine}</span>
          )}
          {resource.type === 'Fargate' && resource.memory && (
            <span className="text-orange-600">• {resource.memory}MB</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Flatten Infrastructure wrapper - show its children directly
function flattenResources(resources: AWSResource[]): AWSResource[] {
  return resources.flatMap(r =>
    r.type === 'Infrastructure' && r.children ? r.children : [r]
  );
}

export function Preview({ resources }: PreviewProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [resources]);

  const flatResources = flattenResources(resources);
  const resourceCount = countResources(resources);

  if (flatResources.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center p-6">
        <div>
          <Box className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">No infrastructure defined</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-3">
      <div key={key} className="space-y-2">
        {flatResources.map((resource, index) => (
          <ResourceCard
            key={`${resource.type}-${resource.name}-${index}`}
            resource={resource}
            index={index}
          />
        ))}
      </div>
      <div className="mt-3 text-center text-xs text-slate-400">
        {resourceCount} resource{resourceCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

function countResources(resources: AWSResource[]): number {
  let count = 0;
  for (const resource of resources) {
    if (resource.type !== 'Infrastructure') {
      count++;
    }
    if (resource.children) {
      count += countResources(resource.children);
    }
  }
  return count;
}
