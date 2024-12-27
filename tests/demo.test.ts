import { describe, expect } from '@jest/globals';
import { formulaUtils } from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaUtils.toFixed(10_000, { comma: true })).toBe('10,000.00');
  });
});

