import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaCalc('abs(1)')).toBe(1);
  });
});

