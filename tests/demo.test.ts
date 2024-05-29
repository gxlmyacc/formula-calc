import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(() => formulaCalc('1 + a', {
      params: {
        a: Promise.resolve(true)
      }
    })).rejects.toThrow('[DecimalError] Invalid argument: true');
  });
});

