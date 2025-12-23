'use client';

import { useEffect, useState } from 'react';
import { Box } from 'lucide-react';
import { AWSResource } from '@/types/aws';
import { ResourceCard } from './ResourceCard';
import { countResources } from '@/lib/utils/resources';

interface PreviewProps {
  resources: AWSResource[];
}

function flattenResources(resources: AWSResource[]): AWSResource[] {
  return resources.flatMap(r =>
    r.type === 'Infrastructure' && r.children ? r.children : [r]
  );
}

export function Preview({ resources }: PreviewProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKey(prev => prev + 1);
  }, [resources]);

  const flatResources = flattenResources(resources);
  const resourceCount = countResources(resources);

  if (flatResources.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center p-6">
        <div>
          <Box className="mx-auto mb-3 h-10 w-10 text-muted/50" />
          <p className="text-sm text-muted">No infrastructure defined</p>
          <p className="text-xs text-muted/60 mt-1">Start writing JSX to see your resources</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div key={key} className="space-y-2">
        {flatResources.map((resource, index) => (
          <ResourceCard
            key={`${resource.type}-${resource.name}-${index}`}
            resource={resource}
            index={index}
          />
        ))}
      </div>
      <div className="mt-4 text-center text-xs text-muted">
        {resourceCount} resource{resourceCount !== 1 ? 's' : ''} defined
      </div>
    </div>
  );
}
