import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('formula test', () => {
  test('formula options', () => {
    expect(formulaCalc('3.334 + 3.335', {
      precision: 2,
      stepRrounding: true,
    })).toBe(6.67);
    expect(formulaCalc('3.3334 + 3.3315', {
      precision: 2,
      stepRrounding: 3,
    })).toBe(6.67);

    expect(formulaCalc('null + 1', {
      nullAsZero: true,
    })).toBe(1);

    expect(formulaCalc('sqrt(-1) + 1', {
      nullAsZero: true,
    })).toBe(1);


    expect(formulaCalc('a + 1', {
      nullAsZero: true,
      params: {
        a: NaN
      }
    })).toBe(1);
    expect(formulaCalc('a.c + 1', {
      nullAsZero: true,
      params: {
        a: {
          b: 1
        }
      }
    })).toBe(1);
  });
});

