import { describe, it, expect } from 'bun:test';
import { countResources } from '@/lib/utils/resources';
import { parseJSX } from '@/lib/parser/jsx-parser';

describe('countResources', () => {
  it('returns 0 for empty array', () => {
    expect(countResources([])).toBe(0);
  });

  it('counts single resource', () => {
    const { resources } = parseJSX('<S3 name="bucket" />');
    expect(countResources(resources)).toBe(1);
  });

  it('counts multiple flat resources', () => {
    const { resources } = parseJSX('<S3 name="bucket" /><Lambda name="api" /><DynamoDB name="data" />');
    expect(countResources(resources)).toBe(3);
  });

  it('counts nested resources', () => {
    const code = `
      <VPC name="main">
        <Lambda name="api" />
        <RDS name="db" />
      </VPC>
    `;
    const { resources } = parseJSX(code);
    expect(countResources(resources)).toBe(3);
  });

  it('excludes Infrastructure containers from count', () => {
    const code = `
      <Infrastructure name="app">
        <S3 name="bucket" />
      </Infrastructure>
    `;
    const { resources } = parseJSX(code);
    expect(countResources(resources)).toBe(1);
  });

  it('counts deeply nested resources', () => {
    const code = `
      <Infrastructure name="app">
        <VPC name="main">
          <Lambda name="api1" />
          <Lambda name="api2" />
          <RDS name="db" />
        </VPC>
        <S3 name="assets" />
        <DynamoDB name="sessions" />
      </Infrastructure>
    `;
    const { resources } = parseJSX(code);
    expect(countResources(resources)).toBe(6);
  });

  it('counts VPC with many children', () => {
    const code = `
      <VPC name="main">
        <Lambda name="func1" />
        <Lambda name="func2" />
        <Lambda name="func3" />
        <RDS name="db" />
        <Fargate name="service" />
      </VPC>
    `;
    const { resources } = parseJSX(code);
    expect(countResources(resources)).toBe(6);
  });

  it('counts multiple Infrastructure blocks', () => {
    const code = `
      <Infrastructure name="app1">
        <S3 name="bucket1" />
      </Infrastructure>
      <Infrastructure name="app2">
        <S3 name="bucket2" />
        <Lambda name="api" />
      </Infrastructure>
    `;
    const { resources } = parseJSX(code);
    expect(countResources(resources)).toBe(3);
  });

  it('counts multiple VPCs', () => {
    const code = `
      <VPC name="vpc1">
        <Lambda name="api1" />
      </VPC>
      <VPC name="vpc2">
        <Lambda name="api2" />
      </VPC>
    `;
    const { resources } = parseJSX(code);
    expect(countResources(resources)).toBe(4);
  });

  it('handles all resource types', () => {
    const code = `
      <VPC name="main">
        <Lambda name="func" />
        <RDS name="db" />
        <Fargate name="service" />
      </VPC>
      <S3 name="bucket" />
      <DynamoDB name="table" />
      <EC2 name="server" />
    `;
    const { resources } = parseJSX(code);
    expect(countResources(resources)).toBe(7);
  });
});
