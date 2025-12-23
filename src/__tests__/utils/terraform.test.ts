import { describe, it, expect } from 'bun:test';
import { sanitizeName } from '@/lib/utils/terraform';

describe('sanitizeName', () => {
  it('returns unchanged alphanumeric string', () => {
    expect(sanitizeName('mybucket')).toBe('mybucket');
  });

  it('preserves underscores', () => {
    expect(sanitizeName('my_bucket')).toBe('my_bucket');
  });

  it('preserves uppercase letters', () => {
    expect(sanitizeName('MyBucket')).toBe('MyBucket');
  });

  it('preserves numbers', () => {
    expect(sanitizeName('bucket123')).toBe('bucket123');
  });

  it('replaces hyphens with underscores', () => {
    expect(sanitizeName('my-bucket')).toBe('my_bucket');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizeName('my bucket')).toBe('my_bucket');
  });

  it('replaces dots with underscores', () => {
    expect(sanitizeName('my.bucket')).toBe('my_bucket');
  });

  it('replaces multiple special characters', () => {
    expect(sanitizeName('my-bucket.name')).toBe('my_bucket_name');
  });

  it('replaces consecutive special characters', () => {
    expect(sanitizeName('my--bucket')).toBe('my__bucket');
  });

  it('handles empty string', () => {
    expect(sanitizeName('')).toBe('');
  });

  it('handles string with only special characters', () => {
    expect(sanitizeName('---')).toBe('___');
  });

  it('handles leading special characters', () => {
    expect(sanitizeName('-bucket')).toBe('_bucket');
  });

  it('handles trailing special characters', () => {
    expect(sanitizeName('bucket-')).toBe('bucket_');
  });

  it('replaces slashes', () => {
    expect(sanitizeName('path/to/bucket')).toBe('path_to_bucket');
  });

  it('replaces colons', () => {
    expect(sanitizeName('aws:s3:bucket')).toBe('aws_s3_bucket');
  });

  it('handles mixed alphanumeric and special chars', () => {
    expect(sanitizeName('api-v2.0-prod')).toBe('api_v2_0_prod');
  });
});
