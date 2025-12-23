import { ParsedClass } from '@/types/aws';

// Size presets mapping for RDS and EC2
const SIZE_PRESETS: Record<string, { rdsInstance: string; ec2Instance: string; memory: number; cpu: number }> = {
  'sm': { rdsInstance: 'db.t4g.small', ec2Instance: 't3.small', memory: 512, cpu: 256 },
  'md': { rdsInstance: 'db.t4g.medium', ec2Instance: 't3.medium', memory: 1024, cpu: 512 },
  'lg': { rdsInstance: 'db.t4g.large', ec2Instance: 't3.large', memory: 2048, cpu: 1024 },
  'xl': { rdsInstance: 'db.t4g.xlarge', ec2Instance: 't3.xlarge', memory: 4096, cpu: 2048 },
  '2xl': { rdsInstance: 'db.t4g.2xlarge', ec2Instance: 't3.2xlarge', memory: 8192, cpu: 4096 },
};

// Parse a className string into structured classes
export function parseClassName(className: string): ParsedClass[] {
  if (!className) return [];
  
  const classes = className.trim().split(/\s+/);
  const parsed: ParsedClass[] = [];
  
  for (const cls of classes) {
    if (!cls) continue;
    
    // Check for prefixed classes (e.g., engine-postgres, storage-100gb)
    const prefixMatch = cls.match(/^([a-z]+)-(.+)$/);
    if (prefixMatch) {
      parsed.push({ prefix: prefixMatch[1], value: prefixMatch[2] });
    } else {
      // Boolean flags or size presets (e.g., multi-az, versioned, lg)
      parsed.push({ prefix: 'flag', value: cls });
    }
  }
  
  return parsed;
}

// Extract engine from parsed classes
export function getEngine(classes: ParsedClass[]): string | undefined {
  const engineClass = classes.find(c => c.prefix === 'engine');
  return engineClass?.value;
}

// Extract instance class from parsed classes
export function getInstanceClass(classes: ParsedClass[], resourceType: 'rds' | 'ec2' = 'rds'): string | undefined {
  // Check for explicit instance class
  const instanceClass = classes.find(c => c.prefix === 'instance');
  if (instanceClass) {
    const preset = SIZE_PRESETS[instanceClass.value];
    if (preset) {
      return resourceType === 'rds' ? preset.rdsInstance : preset.ec2Instance;
    }
    // Direct instance type like t3-medium
    return instanceClass.value.replace(/-/g, '.');
  }
  
  // Check for size preset flag
  const sizeFlag = classes.find(c => c.prefix === 'flag' && SIZE_PRESETS[c.value]);
  if (sizeFlag) {
    const preset = SIZE_PRESETS[sizeFlag.value];
    return resourceType === 'rds' ? preset.rdsInstance : preset.ec2Instance;
  }
  
  return undefined;
}

// Extract storage in GB from parsed classes
export function getStorage(classes: ParsedClass[]): number | undefined {
  const storageClass = classes.find(c => c.prefix === 'storage');
  if (!storageClass) return undefined;
  
  const match = storageClass.value.match(/^(\d+)(gb|tb)$/i);
  if (!match) return undefined;
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  return unit === 'tb' ? value * 1024 : value;
}

// Extract max storage in GB from parsed classes
export function getMaxStorage(classes: ParsedClass[]): number | undefined {
  const maxStorageClass = classes.find(c => c.prefix === 'maxstorage');
  if (!maxStorageClass) return undefined;
  
  const match = maxStorageClass.value.match(/^(\d+)(gb|tb)$/i);
  if (!match) return undefined;
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  return unit === 'tb' ? value * 1024 : value;
}

// Extract backup retention in days from parsed classes
export function getBackupRetention(classes: ParsedClass[]): number | undefined {
  const backupClass = classes.find(c => c.prefix === 'backup');
  if (!backupClass) return undefined;
  
  const match = backupClass.value.match(/^(\d+)(d|days?)$/i);
  if (!match) return parseInt(backupClass.value, 10) || undefined;
  
  return parseInt(match[1], 10);
}

// Extract memory in MB from parsed classes (supports Fargate units)
export function getMemory(classes: ParsedClass[]): number | undefined {
  const memClass = classes.find(c => c.prefix === 'mem');
  if (!memClass) return undefined;
  
  const match = memClass.value.match(/^(\d+)(mb|gb)$/i);
  if (!match) return parseInt(memClass.value, 10) || undefined;
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  return unit === 'gb' ? value * 1024 : value;
}

// Extract CPU from parsed classes (Fargate units: 256, 512, 1024, 2048, 4096)
export function getCpu(classes: ParsedClass[]): number | undefined {
  const cpuClass = classes.find(c => c.prefix === 'cpu');
  if (!cpuClass) return undefined;
  
  const value = parseFloat(cpuClass.value);
  
  // If value is less than 10, assume it's in vCPU format (e.g., 0.25, 0.5, 1, 2, 4)
  if (value < 10) {
    return Math.round(value * 1024);
  }
  
  return Math.round(value);
}

// Extract region from parsed classes
export function getRegion(classes: ParsedClass[]): string | undefined {
  const regionClass = classes.find(c => c.prefix === 'region');
  return regionClass?.value;
}

// Extract runtime from parsed classes
export function getRuntime(classes: ParsedClass[]): string | undefined {
  const runtimeClass = classes.find(c => c.prefix === 'runtime');
  return runtimeClass?.value;
}

// Extract timeout in seconds from parsed classes
export function getTimeout(classes: ParsedClass[]): number | undefined {
  const timeoutClass = classes.find(c => c.prefix === 'timeout');
  if (!timeoutClass) return undefined;
  
  const match = timeoutClass.value.match(/^(\d+)(s|m)$/i);
  if (!match) return parseInt(timeoutClass.value, 10) || undefined;
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  return unit === 'm' ? value * 60 : value;
}

// Extract ACL from parsed classes
export function getAcl(classes: ParsedClass[]): string | undefined {
  const aclClass = classes.find(c => c.prefix === 'acl');
  return aclClass?.value;
}

// Extract CIDR from parsed classes
export function getCidr(classes: ParsedClass[]): string | undefined {
  const cidrClass = classes.find(c => c.prefix === 'cidr');
  return cidrClass?.value;
}

// Extract port from parsed classes
export function getPort(classes: ParsedClass[]): number | undefined {
  const portClass = classes.find(c => c.prefix === 'port');
  if (!portClass) return undefined;
  return parseInt(portClass.value, 10) || undefined;
}

// Extract desired count from parsed classes
export function getDesiredCount(classes: ParsedClass[]): number | undefined {
  const countClass = classes.find(c => c.prefix === 'count' || c.prefix === 'replicas');
  if (!countClass) return undefined;
  return parseInt(countClass.value, 10) || undefined;
}

// Check if a boolean flag is present
export function hasFlag(classes: ParsedClass[], flag: string): boolean {
  return classes.some(c => c.prefix === 'flag' && c.value === flag);
}
