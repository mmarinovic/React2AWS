export interface ClassOption {
  value: string;
  label: string;
  description: string;
  category: string; // Used to filter out mutually exclusive options
}

export interface ComponentSchema {
  name: string;
  description: string;
  options: ClassOption[];
}

export const componentSchemas: Record<string, ComponentSchema> = {
  VPC: {
    name: 'VPC',
    description: 'Virtual Private Cloud',
    options: [
      { value: 'cidr-10.0.0.0/16', label: 'cidr-10.0.0.0/16', description: 'Default VPC CIDR block', category: 'cidr' },
      { value: 'cidr-172.16.0.0/16', label: 'cidr-172.16.0.0/16', description: 'Alternative CIDR block', category: 'cidr' },
      { value: 'cidr-192.168.0.0/16', label: 'cidr-192.168.0.0/16', description: 'Private CIDR block', category: 'cidr' },
      { value: 'region-us-east-1', label: 'region-us-east-1', description: 'N. Virginia', category: 'region' },
      { value: 'region-us-west-2', label: 'region-us-west-2', description: 'Oregon', category: 'region' },
      { value: 'region-eu-west-1', label: 'region-eu-west-1', description: 'Ireland', category: 'region' },
      { value: 'region-eu-central-1', label: 'region-eu-central-1', description: 'Frankfurt', category: 'region' },
      { value: 'region-ap-southeast-1', label: 'region-ap-southeast-1', description: 'Singapore', category: 'region' },
      { value: 'single-nat', label: 'single-nat', description: 'Single NAT Gateway (cost savings)', category: 'nat' },
      { value: 'no-nat', label: 'no-nat', description: 'No NAT Gateway', category: 'nat' },
      { value: 'vpn', label: 'vpn', description: 'Enable VPN Gateway', category: 'vpn' },
    ],
  },

  RDS: {
    name: 'RDS',
    description: 'Relational Database Service',
    options: [
      { value: 'engine-postgres', label: 'engine-postgres', description: 'PostgreSQL database', category: 'engine' },
      { value: 'engine-mysql', label: 'engine-mysql', description: 'MySQL database', category: 'engine' },
      { value: 'engine-mariadb', label: 'engine-mariadb', description: 'MariaDB database', category: 'engine' },
      { value: 'sm', label: 'sm', description: 'Small (db.t4g.small)', category: 'size' },
      { value: 'md', label: 'md', description: 'Medium (db.t4g.medium)', category: 'size' },
      { value: 'lg', label: 'lg', description: 'Large (db.t4g.large)', category: 'size' },
      { value: 'xl', label: 'xl', description: 'XL (db.t4g.xlarge)', category: 'size' },
      { value: 'storage-20gb', label: 'storage-20gb', description: '20 GB storage', category: 'storage' },
      { value: 'storage-50gb', label: 'storage-50gb', description: '50 GB storage', category: 'storage' },
      { value: 'storage-100gb', label: 'storage-100gb', description: '100 GB storage', category: 'storage' },
      { value: 'storage-500gb', label: 'storage-500gb', description: '500 GB storage', category: 'storage' },
      { value: 'maxstorage-100gb', label: 'maxstorage-100gb', description: 'Auto-scale up to 100 GB', category: 'maxstorage' },
      { value: 'maxstorage-500gb', label: 'maxstorage-500gb', description: 'Auto-scale up to 500 GB', category: 'maxstorage' },
      { value: 'maxstorage-1tb', label: 'maxstorage-1tb', description: 'Auto-scale up to 1 TB', category: 'maxstorage' },
      { value: 'backup-7d', label: 'backup-7d', description: '7 days backup retention', category: 'backup' },
      { value: 'backup-14d', label: 'backup-14d', description: '14 days backup retention', category: 'backup' },
      { value: 'backup-30d', label: 'backup-30d', description: '30 days backup retention', category: 'backup' },
      { value: 'multi-az', label: 'multi-az', description: 'Multi-AZ deployment for HA', category: 'multi-az' },
      { value: 'deletion-protection', label: 'deletion-protection', description: 'Prevent accidental deletion', category: 'deletion-protection' },
    ],
  },

  Fargate: {
    name: 'Fargate',
    description: 'Serverless containers (ECS)',
    options: [
      { value: 'mem-512mb', label: 'mem-512mb', description: '512 MB memory', category: 'mem' },
      { value: 'mem-1gb', label: 'mem-1gb', description: '1 GB memory', category: 'mem' },
      { value: 'mem-2gb', label: 'mem-2gb', description: '2 GB memory', category: 'mem' },
      { value: 'mem-4gb', label: 'mem-4gb', description: '4 GB memory', category: 'mem' },
      { value: 'mem-8gb', label: 'mem-8gb', description: '8 GB memory', category: 'mem' },
      { value: 'cpu-0.25', label: 'cpu-0.25', description: '0.25 vCPU', category: 'cpu' },
      { value: 'cpu-0.5', label: 'cpu-0.5', description: '0.5 vCPU', category: 'cpu' },
      { value: 'cpu-1', label: 'cpu-1', description: '1 vCPU', category: 'cpu' },
      { value: 'cpu-2', label: 'cpu-2', description: '2 vCPU', category: 'cpu' },
      { value: 'cpu-4', label: 'cpu-4', description: '4 vCPU', category: 'cpu' },
      { value: 'port-80', label: 'port-80', description: 'HTTP port', category: 'port' },
      { value: 'port-443', label: 'port-443', description: 'HTTPS port', category: 'port' },
      { value: 'port-3000', label: 'port-3000', description: 'Node.js default', category: 'port' },
      { value: 'port-8080', label: 'port-8080', description: 'Alternative HTTP', category: 'port' },
      { value: 'count-1', label: 'count-1', description: '1 replica', category: 'count' },
      { value: 'count-2', label: 'count-2', description: '2 replicas', category: 'count' },
      { value: 'count-3', label: 'count-3', description: '3 replicas', category: 'count' },
    ],
  },

  Lambda: {
    name: 'Lambda',
    description: 'Serverless functions',
    options: [
      { value: 'runtime-nodejs24', label: 'runtime-nodejs24', description: 'Node.js 24.x', category: 'runtime' },
      { value: 'runtime-nodejs22', label: 'runtime-nodejs22', description: 'Node.js 22.x', category: 'runtime' },
      { value: 'runtime-nodejs20', label: 'runtime-nodejs20', description: 'Node.js 20.x', category: 'runtime' },
      { value: 'runtime-python3.14', label: 'runtime-python3.14', description: 'Python 3.14', category: 'runtime' },
      { value: 'runtime-python3.13', label: 'runtime-python3.13', description: 'Python 3.13', category: 'runtime' },
      { value: 'runtime-python3.12', label: 'runtime-python3.12', description: 'Python 3.12', category: 'runtime' },
      { value: 'runtime-java21', label: 'runtime-java21', description: 'Java 21', category: 'runtime' },
      { value: 'runtime-go', label: 'runtime-go', description: 'Go (custom runtime)', category: 'runtime' },
      { value: 'runtime-rust', label: 'runtime-rust', description: 'Rust (custom runtime)', category: 'runtime' },
      { value: 'mem-128mb', label: 'mem-128mb', description: '128 MB memory', category: 'mem' },
      { value: 'mem-256mb', label: 'mem-256mb', description: '256 MB memory', category: 'mem' },
      { value: 'mem-512mb', label: 'mem-512mb', description: '512 MB memory', category: 'mem' },
      { value: 'mem-1gb', label: 'mem-1gb', description: '1 GB memory', category: 'mem' },
      { value: 'mem-2gb', label: 'mem-2gb', description: '2 GB memory', category: 'mem' },
      { value: 'timeout-30s', label: 'timeout-30s', description: '30 second timeout', category: 'timeout' },
      { value: 'timeout-60s', label: 'timeout-60s', description: '1 minute timeout', category: 'timeout' },
      { value: 'timeout-5m', label: 'timeout-5m', description: '5 minute timeout', category: 'timeout' },
      { value: 'timeout-15m', label: 'timeout-15m', description: '15 minute timeout (max)', category: 'timeout' },
    ],
  },

  S3: {
    name: 'S3',
    description: 'Object storage',
    options: [
      { value: 'acl-private', label: 'acl-private', description: 'Private bucket (default)', category: 'acl' },
      { value: 'acl-public-read', label: 'acl-public-read', description: 'Public read access', category: 'acl' },
      { value: 'versioned', label: 'versioned', description: 'Enable versioning', category: 'versioned' },
      { value: 'encrypted', label: 'encrypted', description: 'KMS encryption', category: 'encrypted' },
    ],
  },

  DynamoDB: {
    name: 'DynamoDB',
    description: 'NoSQL database',
    options: [
      { value: 'on-demand', label: 'on-demand', description: 'Pay-per-request (default)', category: 'billing' },
      { value: 'provisioned', label: 'provisioned', description: 'Provisioned capacity', category: 'billing' },
    ],
  },

  EC2: {
    name: 'EC2',
    description: 'Virtual machines',
    options: [
      { value: 'sm', label: 'sm', description: 'Small (t3.small)', category: 'size' },
      { value: 'md', label: 'md', description: 'Medium (t3.medium)', category: 'size' },
      { value: 'lg', label: 'lg', description: 'Large (t3.large)', category: 'size' },
      { value: 'xl', label: 'xl', description: 'XL (t3.xlarge)', category: 'size' },
      { value: 'storage-8gb', label: 'storage-8gb', description: '8 GB root volume', category: 'storage' },
      { value: 'storage-20gb', label: 'storage-20gb', description: '20 GB root volume', category: 'storage' },
      { value: 'storage-50gb', label: 'storage-50gb', description: '50 GB root volume', category: 'storage' },
      { value: 'storage-100gb', label: 'storage-100gb', description: '100 GB root volume', category: 'storage' },
    ],
  },

  ALB: {
    name: 'ALB',
    description: 'Application Load Balancer',
    options: [
      { value: 'public', label: 'public', description: 'Internet-facing ALB', category: 'visibility' },
      { value: 'internal', label: 'internal', description: 'Internal ALB (default)', category: 'visibility' },
    ],
  },

  SecurityGroup: {
    name: 'SecurityGroup',
    description: 'Network security rules',
    options: [
      { value: 'allow-http', label: 'allow-http', description: 'Allow HTTP (port 80)', category: 'allow-http' },
      { value: 'allow-https', label: 'allow-https', description: 'Allow HTTPS (port 443)', category: 'allow-https' },
      { value: 'allow-ssh', label: 'allow-ssh', description: 'Allow SSH (port 22)', category: 'allow-ssh' },
    ],
  },
};

export const componentNames = Object.keys(componentSchemas);

export function getOptionsForComponent(componentName: string): ClassOption[] {
  return componentSchemas[componentName]?.options || [];
}

export function searchOptions(query: string, componentName?: string): ClassOption[] {
  const schemas = componentName
    ? [componentSchemas[componentName]].filter(Boolean)
    : Object.values(componentSchemas);

  const lowercaseQuery = query.toLowerCase();
  const results: ClassOption[] = [];

  for (const schema of schemas) {
    for (const option of schema.options) {
      if (
        option.value.toLowerCase().includes(lowercaseQuery) ||
        option.label.toLowerCase().includes(lowercaseQuery) ||
        option.description.toLowerCase().includes(lowercaseQuery)
      ) {
        results.push(option);
      }
    }
  }

  return results;
}
