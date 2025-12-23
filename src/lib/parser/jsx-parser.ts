import { AWSResource, AWSResourceType, ParseResult } from '@/types/aws';
import { 
  parseClassName, 
  getEngine, 
  getInstanceClass, 
  getStorage, 
  getMemory, 
  getCpu, 
  getRegion,
  getRuntime,
  getTimeout,
  getAcl,
  getCidr,
  hasFlag,
  getPort,
  getDesiredCount,
  getMaxStorage,
  getBackupRetention
} from './class-parser';

const VALID_RESOURCES: AWSResourceType[] = [
  'Infrastructure', 'VPC', 'RDS', 'Fargate', 'EC2', 'S3', 'Lambda', 'DynamoDB', 'ALB', 'SecurityGroup'
];

// Extract attribute value from attributes string
function extractAttribute(attributes: string, attrName: string): string | undefined {
  // Use word boundary or start of string to prevent partial matches
  const regex = new RegExp(`(?:^|\\s)${attrName}=["']([^"']*)["']`, 'i');
  const match = attributes.match(regex);
  return match ? match[1] : undefined;
}

// Parse a single resource from tag info
function parseResource(
  tagName: string,
  attributes: string,
  children: AWSResource[],
): AWSResource | null {
  if (!VALID_RESOURCES.includes(tagName as AWSResourceType)) {
    return null;
  }
  
  const className = extractAttribute(attributes, 'className') || '';
  const name = extractAttribute(attributes, 'name') || tagName.toLowerCase();
  const parsedClasses = parseClassName(className);
  
  const baseResource = {
    type: tagName as AWSResourceType,
    name,
    className,
    parsedClasses,
    children: children.length > 0 ? children : undefined,
  };
  
  switch (tagName) {
    case 'RDS':
      return {
        ...baseResource,
        type: 'RDS',
        engine: getEngine(parsedClasses) || 'postgres',
        instanceClass: getInstanceClass(parsedClasses, 'rds') || 'db.t4g.micro',
        storage: getStorage(parsedClasses) || 20,
        maxStorage: getMaxStorage(parsedClasses) || 100,
        multiAz: hasFlag(parsedClasses, 'multi-az'),
        region: getRegion(parsedClasses),
        backupRetention: getBackupRetention(parsedClasses) || 7,
        deletionProtection: hasFlag(parsedClasses, 'deletion-protection'),
      };
      
    case 'Fargate':
      return {
        ...baseResource,
        type: 'Fargate',
        memory: getMemory(parsedClasses) || 512,
        cpu: getCpu(parsedClasses) || 256,
        region: getRegion(parsedClasses),
        desiredCount: getDesiredCount(parsedClasses) || 1,
        port: getPort(parsedClasses) || 80,
      };
      
    case 'EC2':
      return {
        ...baseResource,
        type: 'EC2',
        instanceType: getInstanceClass(parsedClasses, 'ec2') || 't3.micro',
        storage: getStorage(parsedClasses) || 8,
        region: getRegion(parsedClasses),
      };
      
    case 'S3':
      return {
        ...baseResource,
        type: 'S3',
        acl: getAcl(parsedClasses) || 'private',
        versioned: hasFlag(parsedClasses, 'versioned'),
        encrypted: hasFlag(parsedClasses, 'encrypted'),
      };
      
    case 'Lambda':
      return {
        ...baseResource,
        type: 'Lambda',
        runtime: getRuntime(parsedClasses) || 'nodejs22.x',
        memory: getMemory(parsedClasses) || 128,
        timeout: getTimeout(parsedClasses) || 30,
      };
      
    case 'DynamoDB':
      return {
        ...baseResource,
        type: 'DynamoDB',
        billingMode: hasFlag(parsedClasses, 'on-demand') ? 'PAY_PER_REQUEST' : 'PROVISIONED',
      };
      
    case 'VPC':
      return {
        ...baseResource,
        type: 'VPC',
        cidr: getCidr(parsedClasses) || '10.0.0.0/16',
        region: getRegion(parsedClasses),
        enableNatGateway: !hasFlag(parsedClasses, 'no-nat'),
        singleNatGateway: hasFlag(parsedClasses, 'single-nat'),
        enableVpnGateway: hasFlag(parsedClasses, 'vpn'),
      };
      
    case 'ALB':
      return {
        ...baseResource,
        type: 'ALB',
        internal: !hasFlag(parsedClasses, 'public'),
      };

    case 'SecurityGroup':
      return {
        ...baseResource,
        type: 'SecurityGroup',
        ingressRules: [],
        egressRules: [],
      };
      
    case 'Infrastructure':
      return {
        ...baseResource,
        type: 'Infrastructure',
      };
      
    default:
      return null;
  }
}

// Simple recursive parser using string manipulation
function parseRecursive(code: string): AWSResource[] {
  const resources: AWSResource[] = [];
  let pos = 0;
  
  while (pos < code.length) {
    // Find opening tag
    const tagStart = code.indexOf('<', pos);
    if (tagStart === -1) break;
    
    // Skip closing tags
    if (code[tagStart + 1] === '/') {
      pos = code.indexOf('>', tagStart) + 1;
      continue;
    }
    
    // Extract tag name (allow digits for S3, EC2, etc.)
    const tagNameMatch = code.slice(tagStart + 1).match(/^([A-Z][a-zA-Z0-9]*)/);
    if (!tagNameMatch) {
      pos = tagStart + 1;
      continue;
    }
    
    const tagName = tagNameMatch[1];
    if (!VALID_RESOURCES.includes(tagName as AWSResourceType)) {
      pos = tagStart + 1;
      continue;
    }
    
    // Find end of opening tag
    const tagEnd = code.indexOf('>', tagStart);
    if (tagEnd === -1) break;
    
    const isSelfClosing = code[tagEnd - 1] === '/';
    const attributesStr = code.slice(tagStart + 1 + tagName.length, isSelfClosing ? tagEnd - 1 : tagEnd);
    
    let children: AWSResource[] = [];
    let endPos = tagEnd + 1;
    
    if (!isSelfClosing) {
      // Find matching closing tag
      const closingTag = `</${tagName}>`;
      let depth = 1;
      let searchPos = tagEnd + 1;
      
      while (depth > 0 && searchPos < code.length) {
        const nextOpen = code.indexOf(`<${tagName}`, searchPos);
        const nextClose = code.indexOf(closingTag, searchPos);
        
        if (nextClose === -1) break;
        
        if (nextOpen !== -1 && nextOpen < nextClose) {
          // Check if the opening tag is self-closing
          const checkEnd = code.indexOf('>', nextOpen);
          if (checkEnd !== -1 && code[checkEnd - 1] !== '/') {
            depth++;
          }
          searchPos = checkEnd + 1;
        } else {
          depth--;
          if (depth === 0) {
            // Parse children
            const innerContent = code.slice(tagEnd + 1, nextClose);
            children = parseRecursive(innerContent);
            endPos = nextClose + closingTag.length;
          } else {
            searchPos = nextClose + closingTag.length;
          }
        }
      }
    }
    
    const resource = parseResource(tagName, attributesStr, children);
    if (resource) {
      resources.push(resource);
    }
    
    pos = endPos;
  }
  
  return resources;
}

// Main parse function
export function parseJSX(code: string): ParseResult {
  const errors: string[] = [];
  
  try {
    const resources = parseRecursive(code);
    return { resources, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Failed to parse JSX');
    return { resources: [], errors };
  }
}

// Get all regions from resources
export function extractRegions(resources: AWSResource[]): string[] {
  const regions = new Set<string>();
  
  function traverse(resource: AWSResource) {
    if ('region' in resource && resource.region) {
      regions.add(resource.region);
    }
    if (resource.children) {
      resource.children.forEach(traverse);
    }
  }
  
  resources.forEach(traverse);
  return Array.from(regions);
}
