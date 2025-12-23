import type { AWSResource } from '@/types/aws';

export function countResources(resources: AWSResource[]): number {
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
