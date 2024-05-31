import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import { toRound, getValueByPath, removeFormArray } from '../src';

import FormulaBool from '../src/formula/values/bool';

describe('utils test', () => {
  test('utils', () => {
    expect(toRound(3.335)).toBe(3.34);
    expect(toRound(3.331, 2, 'CEIL')).toBe(3.34);
    // @ts-ignore
    expect(toRound(3.331, 2, 'CEIL1')).toBe(3.33);

    expect(toRound(3.331, 2, Decimal.ROUND_CEIL)).toBe(3.34);

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
});

