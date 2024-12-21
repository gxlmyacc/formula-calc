import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import { getValueByPath, removeFormArray, formulaUtils } from '../src';

import FormulaBool from '../src/formula/values/bool';

describe('utils test', () => {
  test('utils', () => {
    expect(Number(formulaUtils.round(3.335))).toBe(3.34);
    expect(Number(formulaUtils.round(3.331, 2, 'CEIL'))).toBe(3.34);
    // @ts-ignore
    expect(Number(formulaUtils.round(3.331, 2, 'CEIL1'))).toBe(3.33);

    expect(Number(formulaUtils.round(3.331, 2, Decimal.ROUND_CEIL))).toBe(3.34);

    expect(getValueByPath({
      a: {
        b: 1
      }
    }, 'a.b')).toBe(1);
    expect(getValueByPath({
      a: {
        b: 1
      }
    }, 'a.b.c')).toBe(undefined);
    expect(getValueByPath({
      a: {
        b: [{ c: 1 }]
      }
    }, 'a.b.0.c')).toBe(1);
  });

  test('others', () => {
    const value = new FormulaBool('true');
    expect(!!value.options).toBe(true);
  });

  test('removeFormArray', () => {
    let array = [1, 2, 3];
    removeFormArray(array, 1);
    expect(array).toEqual([2, 3]);
    removeFormArray(array, 4);
    expect(array).toEqual([2, 3]);
  });

  test('formulaUtils', () => {
    expect(formulaUtils.sum([1, 2, 3])).toBe(6);
    expect(formulaUtils.sum([new Decimal(1), new Decimal(2), new Decimal(3)])).toBe(6);
    expect(formulaUtils.sum([])).toBe(0);
    expect(formulaUtils.sum([1, 2, 3, null, undefined, ''])).toBe(6);
    expect(formulaUtils.avg([1, 2, 3])).toBe(2);
    expect(formulaUtils.avg([new Decimal(1), new Decimal(2), new Decimal(3)])).toBe(2);
    expect(formulaUtils.avg([])).toBe(0);
    expect(formulaUtils.min([1, 2, 3])).toBe(1);
    expect(formulaUtils.min([new Decimal(1), new Decimal(2), new Decimal(3)])).toBe(1);
    expect(formulaUtils.min([])).toBe(0);
    expect(formulaUtils.max([1, 2, 3])).toBe(3);
    expect(formulaUtils.max([new Decimal(1), new Decimal(2), new Decimal(3)])).toBe(3);
    expect(formulaUtils.max([])).toBe(0);
  });
});

