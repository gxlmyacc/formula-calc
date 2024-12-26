import { describe, expect } from '@jest/globals';
import { formulaUtils } from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaUtils.toFixed(1_000_000.234, { comma: true })).toBe('1,000,000.23');
  });
});

