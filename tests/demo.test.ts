import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaCalc('true & !!1%')).toBe(true);
    expect(formulaCalc('(0.1 + 0.2)%')).toBe(0.003);
  });
});

