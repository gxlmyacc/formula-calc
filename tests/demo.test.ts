import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaCalc(' -1.1 // 6')).toBe(0);
  });
});

