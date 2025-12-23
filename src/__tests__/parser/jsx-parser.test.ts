import { describe, it, expect } from 'bun:test';
import { parseJSX, extractRegions } from '@/lib/parser/jsx-parser';

describe('parseJSX', () => {
  describe('basic parsing', () => {
    it('returns empty resources for empty string', () => {
      const result = parseJSX('');
      expect(result.resources).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('returns empty resources for whitespace only', () => {
      const result = parseJSX('   \n\t  ');
      expect(result.resources).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('parses a self-closing S3 tag', () => {
      const result = parseJSX('<S3 name="mybucket" />');
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].type).toBe('S3');
      expect(result.resources[0].name).toBe('mybucket');
    });

    it('parses a tag with children', () => {
      const result = parseJSX('<VPC name="main"></VPC>');
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].type).toBe('VPC');
      expect(result.resources[0].name).toBe('main');
    });

    it('uses tag name as default name when not specified', () => {
      const result = parseJSX('<Lambda />');
      expect(result.resources[0].name).toBe('lambda');
    });

    it('parses multiple sibling resources', () => {
      const result = parseJSX('<S3 name="bucket1" /><Lambda name="func1" />');
      expect(result.resources).toHaveLength(2);
      expect(result.resources[0].type).toBe('S3');
      expect(result.resources[1].type).toBe('Lambda');
    });

    it('ignores invalid/unknown resource types', () => {
      const result = parseJSX('<InvalidResource name="test" />');
      expect(result.resources).toHaveLength(0);
    });

    it('handles multiline JSX', () => {
      const code = `
        <S3
          name="mybucket"
          className="versioned encrypted"
        />
      `;
      const result = parseJSX(code);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].name).toBe('mybucket');
    });
  });

  describe('nested resources', () => {
    it('parses VPC with child Lambda', () => {
      const code = `
        <VPC name="main">
          <Lambda name="api" />
        </VPC>
      `;
      const result = parseJSX(code);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].type).toBe('VPC');
      expect(result.resources[0].children).toHaveLength(1);
      expect(result.resources[0].children![0].type).toBe('Lambda');
    });

    it('parses Infrastructure with multiple children', () => {
      const code = `
        <Infrastructure name="app">
          <S3 name="assets" />
          <Lambda name="api" />
          <DynamoDB name="data" />
        </Infrastructure>
      `;
      const result = parseJSX(code);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].children).toHaveLength(3);
    });

    it('parses deeply nested structures', () => {
      const code = `
        <Infrastructure name="app">
          <VPC name="main">
            <Lambda name="api" />
            <RDS name="db" />
          </VPC>
        </Infrastructure>
      `;
      const result = parseJSX(code);
      expect(result.resources).toHaveLength(1);
      const infra = result.resources[0];
      expect(infra.children).toHaveLength(1);
      const vpc = infra.children![0];
      expect(vpc.children).toHaveLength(2);
    });

    it('handles same tag type nested', () => {
      const code = `
        <VPC name="outer">
          <VPC name="inner" />
        </VPC>
      `;
      const result = parseJSX(code);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].name).toBe('outer');
      expect(result.resources[0].children).toHaveLength(1);
      expect(result.resources[0].children![0].name).toBe('inner');
    });
  });

  describe('S3 resource', () => {
    it('parses S3 with default values', () => {
      const result = parseJSX('<S3 name="mybucket" />');
      const s3 = result.resources[0];
      expect(s3.type).toBe('S3');
      expect(s3.acl).toBe('private');
      expect(s3.versioned).toBe(false);
      expect(s3.encrypted).toBe(false);
    });

    it('parses S3 with versioned flag', () => {
      const result = parseJSX('<S3 name="mybucket" className="versioned" />');
      expect(result.resources[0].versioned).toBe(true);
    });

    it('parses S3 with encrypted flag', () => {
      const result = parseJSX('<S3 name="mybucket" className="encrypted" />');
      expect(result.resources[0].encrypted).toBe(true);
    });

    it('parses S3 with public-read ACL', () => {
      const result = parseJSX('<S3 name="mybucket" className="acl-public-read" />');
      expect(result.resources[0].acl).toBe('public-read');
    });

    it('parses S3 with multiple flags', () => {
      const result = parseJSX('<S3 name="mybucket" className="versioned encrypted acl-private" />');
      const s3 = result.resources[0];
      expect(s3.versioned).toBe(true);
      expect(s3.encrypted).toBe(true);
      expect(s3.acl).toBe('private');
    });
  });

  describe('Lambda resource', () => {
    it('parses Lambda with default values', () => {
      const result = parseJSX('<Lambda name="api" />');
      const lambda = result.resources[0];
      expect(lambda.type).toBe('Lambda');
      expect(lambda.runtime).toBe('nodejs22.x');
      expect(lambda.memory).toBe(128);
      expect(lambda.timeout).toBe(30);
    });

    it('parses Lambda with custom runtime', () => {
      const result = parseJSX('<Lambda name="api" className="runtime-python3.12" />');
      expect(result.resources[0].runtime).toBe('python3.12');
    });

    it('parses Lambda with custom memory', () => {
      const result = parseJSX('<Lambda name="api" className="mem-512mb" />');
      expect(result.resources[0].memory).toBe(512);
    });

    it('parses Lambda with memory in GB', () => {
      const result = parseJSX('<Lambda name="api" className="mem-2gb" />');
      expect(result.resources[0].memory).toBe(2048);
    });

    it('parses Lambda with custom timeout in seconds', () => {
      const result = parseJSX('<Lambda name="api" className="timeout-60s" />');
      expect(result.resources[0].timeout).toBe(60);
    });

    it('parses Lambda with timeout in minutes', () => {
      const result = parseJSX('<Lambda name="api" className="timeout-5m" />');
      expect(result.resources[0].timeout).toBe(300);
    });

    it('parses Lambda with all configurations', () => {
      const result = parseJSX('<Lambda name="api" className="runtime-nodejs20.x mem-1gb timeout-2m" />');
      const lambda = result.resources[0];
      expect(lambda.runtime).toBe('nodejs20.x');
      expect(lambda.memory).toBe(1024);
      expect(lambda.timeout).toBe(120);
    });
  });

  describe('RDS resource', () => {
    it('parses RDS with default values', () => {
      const result = parseJSX('<RDS name="mydb" />');
      const rds = result.resources[0];
      expect(rds.type).toBe('RDS');
      expect(rds.engine).toBe('postgres');
      expect(rds.instanceClass).toBe('db.t4g.micro');
      expect(rds.storage).toBe(20);
      expect(rds.maxStorage).toBe(100);
      expect(rds.multiAz).toBe(false);
      expect(rds.backupRetention).toBe(7);
      expect(rds.deletionProtection).toBe(false);
    });

    it('parses RDS with mysql engine', () => {
      const result = parseJSX('<RDS name="mydb" className="engine-mysql" />');
      expect(result.resources[0].engine).toBe('mysql');
    });

    it('parses RDS with mariadb engine', () => {
      const result = parseJSX('<RDS name="mydb" className="engine-mariadb" />');
      expect(result.resources[0].engine).toBe('mariadb');
    });

    it('parses RDS with instance size preset', () => {
      const result = parseJSX('<RDS name="mydb" className="instance-lg" />');
      expect(result.resources[0].instanceClass).toBe('db.t4g.large');
    });

    it('parses RDS with storage', () => {
      const result = parseJSX('<RDS name="mydb" className="storage-100gb" />');
      expect(result.resources[0].storage).toBe(100);
    });

    it('parses RDS with max storage', () => {
      const result = parseJSX('<RDS name="mydb" className="maxstorage-500gb" />');
      expect(result.resources[0].maxStorage).toBe(500);
    });

    it('parses RDS with backup retention', () => {
      const result = parseJSX('<RDS name="mydb" className="backup-14d" />');
      expect(result.resources[0].backupRetention).toBe(14);
    });

    it('parses RDS with region', () => {
      const result = parseJSX('<RDS name="mydb" className="region-eu-west-1" />');
      expect(result.resources[0].region).toBe('eu-west-1');
    });

    it('parses RDS with production configuration', () => {
      const code = '<RDS name="proddb" className="engine-postgres instance-xl storage-500gb maxstorage-1tb backup-30d region-us-east-1" />';
      const result = parseJSX(code);
      const rds = result.resources[0];
      expect(rds.engine).toBe('postgres');
      expect(rds.instanceClass).toBe('db.t4g.xlarge');
      expect(rds.storage).toBe(500);
      expect(rds.maxStorage).toBe(1024);
      expect(rds.backupRetention).toBe(30);
      expect(rds.region).toBe('us-east-1');
    });
  });

  describe('DynamoDB resource', () => {
    it('parses DynamoDB with default values', () => {
      const result = parseJSX('<DynamoDB name="users" />');
      const dynamo = result.resources[0];
      expect(dynamo.type).toBe('DynamoDB');
      expect(dynamo.billingMode).toBe('PROVISIONED');
    });
  });

  describe('VPC resource', () => {
    it('parses VPC with default values', () => {
      const result = parseJSX('<VPC name="main" />');
      const vpc = result.resources[0];
      expect(vpc.type).toBe('VPC');
      expect(vpc.cidr).toBe('10.0.0.0/16');
      expect(vpc.enableNatGateway).toBe(true);
      expect(vpc.singleNatGateway).toBe(false);
      expect(vpc.enableVpnGateway).toBe(false);
    });

    it('parses VPC with custom CIDR', () => {
      const result = parseJSX('<VPC name="main" className="cidr-192.168.0.0/16" />');
      expect(result.resources[0].cidr).toBe('192.168.0.0/16');
    });

    it('parses VPC with nonat flag (no hyphen)', () => {
      const result = parseJSX('<VPC name="main" className="nonat" />');
      expect(result.resources[0].enableNatGateway).toBe(true);
    });

    it('parses VPC with singlenat flag (no hyphen)', () => {
      const result = parseJSX('<VPC name="main" className="singlenat" />');
      expect(result.resources[0].singleNatGateway).toBe(false);
    });

    it('parses VPC with VPN gateway', () => {
      const result = parseJSX('<VPC name="main" className="vpn" />');
      expect(result.resources[0].enableVpnGateway).toBe(true);
    });

    it('parses VPC with region', () => {
      const result = parseJSX('<VPC name="main" className="region-ap-southeast-1" />');
      expect(result.resources[0].region).toBe('ap-southeast-1');
    });
  });

  describe('Fargate resource', () => {
    it('parses Fargate with default values', () => {
      const result = parseJSX('<Fargate name="api" />');
      const fargate = result.resources[0];
      expect(fargate.type).toBe('Fargate');
      expect(fargate.memory).toBe(512);
      expect(fargate.cpu).toBe(256);
      expect(fargate.desiredCount).toBe(1);
      expect(fargate.port).toBe(80);
    });

    it('parses Fargate with custom memory', () => {
      const result = parseJSX('<Fargate name="api" className="mem-1gb" />');
      expect(result.resources[0].memory).toBe(1024);
    });

    it('parses Fargate with custom CPU', () => {
      const result = parseJSX('<Fargate name="api" className="cpu-512" />');
      expect(result.resources[0].cpu).toBe(512);
    });

    it('parses Fargate with vCPU notation', () => {
      const result = parseJSX('<Fargate name="api" className="cpu-1" />');
      expect(result.resources[0].cpu).toBe(1024);
    });

    it('parses Fargate with desired count', () => {
      const result = parseJSX('<Fargate name="api" className="count-3" />');
      expect(result.resources[0].desiredCount).toBe(3);
    });

    it('parses Fargate with replicas', () => {
      const result = parseJSX('<Fargate name="api" className="replicas-5" />');
      expect(result.resources[0].desiredCount).toBe(5);
    });

    it('parses Fargate with custom port', () => {
      const result = parseJSX('<Fargate name="api" className="port-8080" />');
      expect(result.resources[0].port).toBe(8080);
    });

    it('parses Fargate with region', () => {
      const result = parseJSX('<Fargate name="api" className="region-us-west-2" />');
      expect(result.resources[0].region).toBe('us-west-2');
    });
  });

  describe('EC2 resource', () => {
    it('parses EC2 with default values', () => {
      const result = parseJSX('<EC2 name="server" />');
      const ec2 = result.resources[0];
      expect(ec2.type).toBe('EC2');
      expect(ec2.instanceType).toBe('t3.micro');
      expect(ec2.storage).toBe(8);
    });

    it('parses EC2 with instance size preset', () => {
      const result = parseJSX('<EC2 name="server" className="instance-lg" />');
      expect(result.resources[0].instanceType).toBe('t3.large');
    });

    it('parses EC2 with custom storage', () => {
      const result = parseJSX('<EC2 name="server" className="storage-100gb" />');
      expect(result.resources[0].storage).toBe(100);
    });

    it('parses EC2 with region', () => {
      const result = parseJSX('<EC2 name="server" className="region-eu-central-1" />');
      expect(result.resources[0].region).toBe('eu-central-1');
    });
  });

  describe('ALB resource', () => {
    it('parses ALB with default values', () => {
      const result = parseJSX('<ALB name="web" />');
      const alb = result.resources[0];
      expect(alb.type).toBe('ALB');
      expect(alb.internal).toBe(true);
    });

    it('parses ALB as public', () => {
      const result = parseJSX('<ALB name="web" className="public" />');
      expect(result.resources[0].internal).toBe(false);
    });
  });

  describe('SecurityGroup resource', () => {
    it('parses SecurityGroup', () => {
      const result = parseJSX('<SecurityGroup name="web-sg" />');
      const sg = result.resources[0];
      expect(sg.type).toBe('SecurityGroup');
      expect(sg.ingressRules).toEqual([]);
      expect(sg.egressRules).toEqual([]);
    });
  });

  describe('Infrastructure container', () => {
    it('parses Infrastructure wrapper', () => {
      const result = parseJSX('<Infrastructure name="myapp" />');
      expect(result.resources[0].type).toBe('Infrastructure');
      expect(result.resources[0].name).toBe('myapp');
    });

    it('parses Infrastructure with children', () => {
      const code = `
        <Infrastructure name="myapp">
          <S3 name="storage" />
        </Infrastructure>
      `;
      const result = parseJSX(code);
      expect(result.resources[0].children).toHaveLength(1);
    });
  });

  describe('attribute extraction', () => {
    it('extracts name with single quotes', () => {
      const result = parseJSX("<S3 name='mybucket' />");
      expect(result.resources[0].name).toBe('mybucket');
    });

    it('extracts name with double quotes', () => {
      const result = parseJSX('<S3 name="mybucket" />');
      expect(result.resources[0].name).toBe('mybucket');
    });

    it('extracts className attribute', () => {
      const result = parseJSX('<S3 name="bucket" className="versioned" />');
      expect(result.resources[0].className).toBe('versioned');
      expect(result.resources[0].versioned).toBe(true);
    });

    it('preserves parsedClasses array', () => {
      const result = parseJSX('<S3 name="bucket" className="versioned encrypted" />');
      expect(result.resources[0].parsedClasses).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('handles unclosed tags gracefully', () => {
      const result = parseJSX('<S3 name="bucket"');
      expect(result.resources).toEqual([]);
    });

    it('handles text content between tags', () => {
      const code = '<VPC name="main">some text<Lambda name="api" /></VPC>';
      const result = parseJSX(code);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].children).toHaveLength(1);
    });

    it('returns errors array (empty for valid input)', () => {
      const result = parseJSX('<S3 name="bucket" />');
      expect(result.errors).toEqual([]);
    });
  });

  describe('complex scenarios', () => {
    it('parses full-stack infrastructure', () => {
      const code = `
        <Infrastructure name="fullstack">
          <VPC name="main" className="region-us-east-1">
            <Lambda name="api" className="runtime-nodejs20.x mem-512mb" />
            <RDS name="db" className="engine-postgres instance-lg storage-100gb" />
            <Fargate name="web" className="cpu-1 mem-2gb count-3 port-3000" />
          </VPC>
          <S3 name="assets" className="versioned encrypted" />
          <DynamoDB name="sessions" />
        </Infrastructure>
      `;
      const result = parseJSX(code);

      expect(result.resources).toHaveLength(1);
      const infra = result.resources[0];
      expect(infra.type).toBe('Infrastructure');
      expect(infra.children).toHaveLength(3);

      const vpc = infra.children![0];
      expect(vpc.type).toBe('VPC');
      expect(vpc.children).toHaveLength(3);

      const s3 = infra.children![1];
      expect(s3.type).toBe('S3');
      expect(s3.versioned).toBe(true);

      const dynamo = infra.children![2];
      expect(dynamo.type).toBe('DynamoDB');
      expect(dynamo.billingMode).toBe('PROVISIONED');
    });

    it('parses multiple VPCs', () => {
      const code = `
        <VPC name="prod" className="region-us-east-1">
          <Lambda name="api" />
        </VPC>
        <VPC name="dev" className="region-us-west-2">
          <Lambda name="api-dev" />
        </VPC>
      `;
      const result = parseJSX(code);
      expect(result.resources).toHaveLength(2);
      expect(result.resources[0].name).toBe('prod');
      expect(result.resources[1].name).toBe('dev');
    });
  });
});

describe('extractRegions', () => {
  it('returns empty array for empty resources', () => {
    expect(extractRegions([])).toEqual([]);
  });

  it('returns empty array when no regions specified', () => {
    const result = parseJSX('<S3 name="bucket" />');
    expect(extractRegions(result.resources)).toEqual([]);
  });

  it('extracts single region from resource', () => {
    const result = parseJSX('<VPC name="main" className="region-us-east-1" />');
    const regions = extractRegions(result.resources);
    expect(regions).toContain('us-east-1');
  });

  it('extracts region from nested resources', () => {
    const code = `
      <VPC name="main">
        <RDS name="db" className="region-eu-west-1" />
      </VPC>
    `;
    const result = parseJSX(code);
    const regions = extractRegions(result.resources);
    expect(regions).toContain('eu-west-1');
  });

  it('collects multiple unique regions', () => {
    const code = `
      <VPC name="vpc1" className="region-us-east-1">
        <RDS name="db" className="region-us-east-1" />
      </VPC>
      <VPC name="vpc2" className="region-eu-west-1" />
    `;
    const result = parseJSX(code);
    const regions = extractRegions(result.resources);
    expect(regions).toHaveLength(2);
    expect(regions).toContain('us-east-1');
    expect(regions).toContain('eu-west-1');
  });

  it('deduplicates same regions', () => {
    const code = `
      <VPC name="vpc1" className="region-us-east-1" />
      <VPC name="vpc2" className="region-us-east-1" />
      <VPC name="vpc3" className="region-us-east-1" />
    `;
    const result = parseJSX(code);
    const regions = extractRegions(result.resources);
    expect(regions).toHaveLength(1);
    expect(regions[0]).toBe('us-east-1');
  });

  it('extracts regions from deeply nested structures', () => {
    const code = `
      <Infrastructure name="app">
        <VPC name="main" className="region-us-west-2">
          <Lambda name="api" />
          <RDS name="db" className="region-ap-southeast-1" />
        </VPC>
      </Infrastructure>
    `;
    const result = parseJSX(code);
    const regions = extractRegions(result.resources);
    expect(regions).toHaveLength(2);
    expect(regions).toContain('us-west-2');
    expect(regions).toContain('ap-southeast-1');
  });
});
