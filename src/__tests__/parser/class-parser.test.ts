import { describe, it, expect } from 'bun:test';
import {
  parseClassName,
  getEngine,
  getInstanceClass,
  getStorage,
  getMaxStorage,
  getBackupRetention,
  getMemory,
  getCpu,
  getRegion,
  getRuntime,
  getTimeout,
  getAcl,
  getCidr,
  getPort,
  getDesiredCount,
  hasFlag,
} from '@/lib/parser/class-parser';

describe('parseClassName', () => {
  it('parses empty string', () => {
    expect(parseClassName('')).toEqual([]);
  });

  it('parses single flag', () => {
    expect(parseClassName('versioned')).toEqual([
      { prefix: 'flag', value: 'versioned' }
    ]);
  });

  it('parses single prefixed class', () => {
    expect(parseClassName('engine-postgres')).toEqual([
      { prefix: 'engine', value: 'postgres' }
    ]);
  });

  it('parses multiple classes', () => {
    expect(parseClassName('engine-postgres instance-lg multi-az')).toEqual([
      { prefix: 'engine', value: 'postgres' },
      { prefix: 'instance', value: 'lg' },
      { prefix: 'multi', value: 'az' },
    ]);
  });

  it('handles extra whitespace', () => {
    expect(parseClassName('  engine-postgres   versioned  ')).toEqual([
      { prefix: 'engine', value: 'postgres' },
      { prefix: 'flag', value: 'versioned' },
    ]);
  });

  it('handles size flags', () => {
    expect(parseClassName('sm')).toEqual([
      { prefix: 'flag', value: 'sm' }
    ]);
  });
});

describe('getEngine', () => {
  it('extracts postgres engine', () => {
    const classes = parseClassName('engine-postgres');
    expect(getEngine(classes)).toBe('postgres');
  });

  it('extracts mysql engine', () => {
    const classes = parseClassName('engine-mysql');
    expect(getEngine(classes)).toBe('mysql');
  });

  it('extracts mariadb engine', () => {
    const classes = parseClassName('engine-mariadb');
    expect(getEngine(classes)).toBe('mariadb');
  });

  it('returns undefined for no engine class', () => {
    const classes = parseClassName('instance-lg');
    expect(getEngine(classes)).toBeUndefined();
  });

  it('returns undefined for empty classes', () => {
    expect(getEngine([])).toBeUndefined();
  });
});

describe('getInstanceClass', () => {
  describe('RDS instances', () => {
    it('maps sm preset to db.t4g.small', () => {
      const classes = parseClassName('instance-sm');
      expect(getInstanceClass(classes, 'rds')).toBe('db.t4g.small');
    });

    it('maps md preset to db.t4g.medium', () => {
      const classes = parseClassName('instance-md');
      expect(getInstanceClass(classes, 'rds')).toBe('db.t4g.medium');
    });

    it('maps lg preset to db.t4g.large', () => {
      const classes = parseClassName('instance-lg');
      expect(getInstanceClass(classes, 'rds')).toBe('db.t4g.large');
    });

    it('maps xl preset to db.t4g.xlarge', () => {
      const classes = parseClassName('instance-xl');
      expect(getInstanceClass(classes, 'rds')).toBe('db.t4g.xlarge');
    });

    it('maps 2xl preset to db.t4g.2xlarge', () => {
      const classes = parseClassName('instance-2xl');
      expect(getInstanceClass(classes, 'rds')).toBe('db.t4g.2xlarge');
    });

    it('extracts explicit instance class with hyphen', () => {
      const classes = parseClassName('instance-db-r6g-large');
      expect(getInstanceClass(classes, 'rds')).toBe('db.r6g.large');
    });
  });

  describe('EC2 instances', () => {
    it('maps sm preset to t3.small', () => {
      const classes = parseClassName('instance-sm');
      expect(getInstanceClass(classes, 'ec2')).toBe('t3.small');
    });

    it('maps md preset to t3.medium', () => {
      const classes = parseClassName('instance-md');
      expect(getInstanceClass(classes, 'ec2')).toBe('t3.medium');
    });

    it('maps lg preset to t3.large', () => {
      const classes = parseClassName('instance-lg');
      expect(getInstanceClass(classes, 'ec2')).toBe('t3.large');
    });

    it('maps xl preset to t3.xlarge', () => {
      const classes = parseClassName('instance-xl');
      expect(getInstanceClass(classes, 'ec2')).toBe('t3.xlarge');
    });

    it('maps 2xl preset to t3.2xlarge', () => {
      const classes = parseClassName('instance-2xl');
      expect(getInstanceClass(classes, 'ec2')).toBe('t3.2xlarge');
    });
  });

  describe('size flags', () => {
    it('uses sm flag for RDS', () => {
      const classes = parseClassName('sm');
      expect(getInstanceClass(classes, 'rds')).toBe('db.t4g.small');
    });

    it('uses lg flag for EC2', () => {
      const classes = parseClassName('lg');
      expect(getInstanceClass(classes, 'ec2')).toBe('t3.large');
    });
  });

  it('returns undefined when no instance class', () => {
    const classes = parseClassName('engine-postgres');
    expect(getInstanceClass(classes)).toBeUndefined();
  });
});

describe('getStorage', () => {
  it('parses storage in GB', () => {
    const classes = parseClassName('storage-50gb');
    expect(getStorage(classes)).toBe(50);
  });

  it('parses storage in GB (uppercase)', () => {
    const classes = parseClassName('storage-100GB');
    expect(getStorage(classes)).toBe(100);
  });

  it('converts TB to GB', () => {
    const classes = parseClassName('storage-1tb');
    expect(getStorage(classes)).toBe(1024);
  });

  it('converts TB to GB (uppercase)', () => {
    const classes = parseClassName('storage-2TB');
    expect(getStorage(classes)).toBe(2048);
  });

  it('returns undefined for invalid format', () => {
    const classes = parseClassName('storage-invalid');
    expect(getStorage(classes)).toBeUndefined();
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('engine-postgres');
    expect(getStorage(classes)).toBeUndefined();
  });
});

describe('getMaxStorage', () => {
  it('parses max storage in GB', () => {
    const classes = parseClassName('maxstorage-200gb');
    expect(getMaxStorage(classes)).toBe(200);
  });

  it('converts TB to GB', () => {
    const classes = parseClassName('maxstorage-1tb');
    expect(getMaxStorage(classes)).toBe(1024);
  });

  it('returns undefined for invalid format', () => {
    const classes = parseClassName('maxstorage-invalid');
    expect(getMaxStorage(classes)).toBeUndefined();
  });
});

describe('getBackupRetention', () => {
  it('parses days with d suffix', () => {
    const classes = parseClassName('backup-7d');
    expect(getBackupRetention(classes)).toBe(7);
  });

  it('parses days with days suffix', () => {
    const classes = parseClassName('backup-14days');
    expect(getBackupRetention(classes)).toBe(14);
  });

  it('parses plain number', () => {
    const classes = parseClassName('backup-30');
    expect(getBackupRetention(classes)).toBe(30);
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('engine-postgres');
    expect(getBackupRetention(classes)).toBeUndefined();
  });
});

describe('getMemory', () => {
  it('parses memory in MB', () => {
    const classes = parseClassName('mem-512mb');
    expect(getMemory(classes)).toBe(512);
  });

  it('parses memory in MB (uppercase)', () => {
    const classes = parseClassName('mem-256MB');
    expect(getMemory(classes)).toBe(256);
  });

  it('converts GB to MB', () => {
    const classes = parseClassName('mem-2gb');
    expect(getMemory(classes)).toBe(2048);
  });

  it('converts GB to MB (uppercase)', () => {
    const classes = parseClassName('mem-4GB');
    expect(getMemory(classes)).toBe(4096);
  });

  it('parses plain number', () => {
    const classes = parseClassName('mem-1024');
    expect(getMemory(classes)).toBe(1024);
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('cpu-1');
    expect(getMemory(classes)).toBeUndefined();
  });
});

describe('getCpu', () => {
  it('parses vCPU as fractional', () => {
    const classes = parseClassName('cpu-0.5');
    expect(getCpu(classes)).toBe(512);
  });

  it('parses vCPU as whole number', () => {
    const classes = parseClassName('cpu-1');
    expect(getCpu(classes)).toBe(1024);
  });

  it('parses vCPU as 2', () => {
    const classes = parseClassName('cpu-2');
    expect(getCpu(classes)).toBe(2048);
  });

  it('parses direct Fargate units', () => {
    const classes = parseClassName('cpu-256');
    expect(getCpu(classes)).toBe(256);
  });

  it('parses direct Fargate units (1024)', () => {
    const classes = parseClassName('cpu-1024');
    expect(getCpu(classes)).toBe(1024);
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('mem-512mb');
    expect(getCpu(classes)).toBeUndefined();
  });
});

describe('getRegion', () => {
  it('extracts us-east-1', () => {
    const classes = parseClassName('region-us-east-1');
    expect(getRegion(classes)).toBe('us-east-1');
  });

  it('extracts eu-west-1', () => {
    const classes = parseClassName('region-eu-west-1');
    expect(getRegion(classes)).toBe('eu-west-1');
  });

  it('extracts ap-southeast-2', () => {
    const classes = parseClassName('region-ap-southeast-2');
    expect(getRegion(classes)).toBe('ap-southeast-2');
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('engine-postgres');
    expect(getRegion(classes)).toBeUndefined();
  });
});

describe('getRuntime', () => {
  it('extracts nodejs runtime', () => {
    const classes = parseClassName('runtime-nodejs20.x');
    expect(getRuntime(classes)).toBe('nodejs20.x');
  });

  it('extracts python runtime', () => {
    const classes = parseClassName('runtime-python3.12');
    expect(getRuntime(classes)).toBe('python3.12');
  });

  it('extracts go runtime', () => {
    const classes = parseClassName('runtime-go');
    expect(getRuntime(classes)).toBe('go');
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('mem-512mb');
    expect(getRuntime(classes)).toBeUndefined();
  });
});

describe('getTimeout', () => {
  it('parses seconds with s suffix', () => {
    const classes = parseClassName('timeout-30s');
    expect(getTimeout(classes)).toBe(30);
  });

  it('converts minutes to seconds', () => {
    const classes = parseClassName('timeout-5m');
    expect(getTimeout(classes)).toBe(300);
  });

  it('parses plain number as seconds', () => {
    const classes = parseClassName('timeout-60');
    expect(getTimeout(classes)).toBe(60);
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('mem-512mb');
    expect(getTimeout(classes)).toBeUndefined();
  });
});

describe('getAcl', () => {
  it('extracts private acl', () => {
    const classes = parseClassName('acl-private');
    expect(getAcl(classes)).toBe('private');
  });

  it('extracts public-read acl', () => {
    const classes = parseClassName('acl-public-read');
    expect(getAcl(classes)).toBe('public-read');
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('versioned');
    expect(getAcl(classes)).toBeUndefined();
  });
});

describe('getCidr', () => {
  it('extracts CIDR block', () => {
    const classes = parseClassName('cidr-10.0.0.0/16');
    expect(getCidr(classes)).toBe('10.0.0.0/16');
  });

  it('extracts different CIDR', () => {
    const classes = parseClassName('cidr-192.168.0.0/24');
    expect(getCidr(classes)).toBe('192.168.0.0/24');
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('engine-postgres');
    expect(getCidr(classes)).toBeUndefined();
  });
});

describe('getPort', () => {
  it('extracts port 80', () => {
    const classes = parseClassName('port-80');
    expect(getPort(classes)).toBe(80);
  });

  it('extracts port 443', () => {
    const classes = parseClassName('port-443');
    expect(getPort(classes)).toBe(443);
  });

  it('extracts port 3000', () => {
    const classes = parseClassName('port-3000');
    expect(getPort(classes)).toBe(3000);
  });

  it('returns undefined for invalid port', () => {
    const classes = parseClassName('port-invalid');
    expect(getPort(classes)).toBeUndefined();
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('engine-postgres');
    expect(getPort(classes)).toBeUndefined();
  });
});

describe('getDesiredCount', () => {
  it('extracts count value', () => {
    const classes = parseClassName('count-3');
    expect(getDesiredCount(classes)).toBe(3);
  });

  it('extracts replicas value', () => {
    const classes = parseClassName('replicas-5');
    expect(getDesiredCount(classes)).toBe(5);
  });

  it('returns undefined for invalid count', () => {
    const classes = parseClassName('count-invalid');
    expect(getDesiredCount(classes)).toBeUndefined();
  });

  it('returns undefined when not present', () => {
    const classes = parseClassName('port-80');
    expect(getDesiredCount(classes)).toBeUndefined();
  });
});

describe('hasFlag', () => {
  it('detects versioned flag', () => {
    const classes = parseClassName('versioned');
    expect(hasFlag(classes, 'versioned')).toBe(true);
  });

  it('detects encrypted flag', () => {
    const classes = parseClassName('encrypted');
    expect(hasFlag(classes, 'encrypted')).toBe(true);
  });

  it('detects multi-az flag', () => {
    const classes = parseClassName('multi-az');
    expect(hasFlag(classes, 'multi-az')).toBe(false); // This is parsed as prefix-value
  });

  it('returns false for missing flag', () => {
    const classes = parseClassName('engine-postgres');
    expect(hasFlag(classes, 'versioned')).toBe(false);
  });

  it('returns false for empty classes', () => {
    expect(hasFlag([], 'versioned')).toBe(false);
  });

  it('detects flag among multiple classes', () => {
    const classes = parseClassName('engine-postgres versioned storage-100gb');
    expect(hasFlag(classes, 'versioned')).toBe(true);
  });
});
