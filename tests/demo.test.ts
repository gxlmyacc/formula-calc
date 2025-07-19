import { describe, expect } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaCalc('a * b%', {
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 7.5
      }
    })).toBe(360.02);
    expect(formulaCalc('a * b%', {
      stepPrecision: 2,
      stepPrecisionIgnorePercent: true,
      params: {
        a: 4500.22,
        b: 7.5
      }
    })).toBe(337.52);
  });
});

