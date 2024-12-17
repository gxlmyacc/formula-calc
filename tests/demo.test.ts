import { describe, expect } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaCalc(
      `
        a > 0
        ? eval(planA)
        : eval(planB)
      `, {
        params: {
          a: -3,
          planA: 'a + 1',
          planB: '0 - a + 1',
        }
      }
    )).toBe(4);
  });
});

