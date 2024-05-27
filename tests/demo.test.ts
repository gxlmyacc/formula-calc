import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('demo test', () => {
  test('demo', () => {
    expect(formulaCalc('(1,2,3)')).toStrictEqual([1, 2, 3]);
  });
});

