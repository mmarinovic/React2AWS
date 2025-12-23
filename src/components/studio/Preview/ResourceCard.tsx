'use client';

import { Network, Box } from 'lucide-react';
import { AWSResource } from '@/types/aws';
import { resourceIcons, resourceColors, defaultColors } from './constants';

interface ResourceCardProps {
  resource: AWSResource;
  index: number;
}

export function ResourceCard({ resource, index }: ResourceCardProps) {
  const Icon = resourceIcons[resource.type] || Box;
  const colors = resourceColors[resource.type] || defaultColors;
  const animationDelay = `${index * 50}ms`;

  if (resource.type === 'VPC' && resource.children && resource.children.length > 0) {
    return (
      <div
        className="animate-fade-in-up rounded-xl border border-border bg-surface/50"
        style={{ animationDelay }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
          <Network className="h-4 w-4 text-muted" />
          <span className="text-sm font-medium text-foreground">{resource.name}</span>
          {'cidr' in resource && resource.cidr && (
            <span className="text-xs text-muted bg-surface-elevated px-1.5 py-0.5 rounded">{resource.cidr}</span>
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

  return (
    <div
      className={`animate-fade-in-up flex items-center gap-3 rounded-lg border ${colors.bg} ${colors.border} px-3 py-2.5 transition-colors hover:bg-opacity-70`}
      style={{ animationDelay }}
    >
      <Icon className={`h-4 w-4 shrink-0 ${colors.text}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate">{resource.name}</div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>{resource.type}</span>
          {resource.type === 'Lambda' && resource.runtime && (
            <span className="text-purple-400">• {resource.runtime}</span>
          )}
          {resource.type === 'RDS' && resource.engine && (
            <span className="text-blue-400">• {resource.engine}</span>
          )}
          {resource.type === 'Fargate' && resource.memory && (
            <span className="text-accent">• {resource.memory}MB</span>
          )}
        </div>
      </div>
    </div>
  );
}
