import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import { getValueByPath, removeFormArray, formulaUtils, createToken, TokenType } from '../src';

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
    const value = new FormulaBool(createToken('true', TokenType.ttBool));
    expect(!!value.options).toBe(true);
  });

  test('removeFormArray', () => {
    const array = [1, 2, 3];
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

    expect(formulaUtils.add(0.1, 0.2)).toBe(0.3);
    expect(formulaUtils.add('0.1', '0.2')).toBe(0.3);
    expect(formulaUtils.add(new Decimal(0.1), new Decimal(0.2))).toBe(0.3);
    expect(formulaUtils.add(0.1, null)).toBe(0.1);

    expect(formulaUtils.sub(0.1, 0.2)).toBe(-0.1);
    expect(formulaUtils.sub('0.1', '0.2')).toBe(-0.1);
    expect(formulaUtils.sub(new Decimal(0.1), new Decimal(0.2))).toBe(-0.1);
    expect(formulaUtils.sub(0.1, null)).toBe(0.1);

    expect(formulaUtils.mul(0.1, 0.2)).toBe(0.02);
    expect(formulaUtils.mul('0.1', '0.2')).toBe(0.02);
    expect(formulaUtils.mul(new Decimal(0.1), new Decimal(0.2))).toBe(0.02);
    expect(formulaUtils.mul(0.1, null)).toBe(0);

    expect(formulaUtils.div(10, 3, { precision: 2 })).toBe(3.33);
    expect(formulaUtils.div('10', '3', { precision: 2 })).toBe(3.33);
    expect(formulaUtils.div(new Decimal(10), new Decimal(3), { precision: 2 })).toBe(3.33);
    expect(formulaUtils.div(10, null, { precision: 2 })).toBe(Infinity);

    expect(formulaUtils.divToInt(10, 3)).toBe(3);
    expect(formulaUtils.divToInt('10', '3')).toBe(3);
    expect(formulaUtils.divToInt(new Decimal(10), new Decimal(3))).toBe(3);
    expect(formulaUtils.divToInt(null, 3)).toBe(0);

    expect(formulaUtils.mod(10, 3)).toBe(1);
    expect(formulaUtils.mod('10', '3')).toBe(1);
    expect(formulaUtils.mod(new Decimal(10), new Decimal(3))).toBe(1);
    expect(formulaUtils.mod(10, null)).toBe(0);

    expect(formulaUtils.pow(2, 3)).toBe(8);
    expect(formulaUtils.pow('2', '3')).toBe(8);
    expect(formulaUtils.pow(new Decimal(2), new Decimal(3))).toBe(8);
    expect(formulaUtils.pow(10, null)).toBe(1);

    expect(formulaUtils.abs(-1)).toBe(1);
    expect(formulaUtils.ceil(1.234)).toBe(2);
    expect(formulaUtils.floor(1.234)).toBe(1);
    expect(formulaUtils.trunc(1.234)).toBe(1);

    expect(formulaUtils.clamp(10.1, 1, 10)).toBe(10);
    expect(formulaUtils.clamp('10.1', '1', '10')).toBe(10);
    expect(formulaUtils.clamp(new Decimal(10.1), new Decimal(1), new Decimal(10))).toBe(10);
    expect(formulaUtils.clamp(null, null, 10)).toBe(0);
  });

  test('format', () => {
    expect(formulaUtils.toFixed(1.234)).toBe('1.23');
    expect(formulaUtils.toFixed(1.235)).toBe('1.24');
    expect(formulaUtils.toFixed(1.255)).toBe('1.26');
    expect(formulaUtils.toFixed('1.234')).toBe('1.23');
    expect(formulaUtils.toFixed(new Decimal(1.234))).toBe('1.23');
    expect(formulaUtils.toFixed(1.2)).toBe('1.20');

    expect(formulaUtils.toFixed(1.235)).toBe('1.24');
    expect(formulaUtils.toFixed('1.235')).toBe('1.24');
    expect(formulaUtils.toFixed(new Decimal(1.235))).toBe('1.24');

    expect(formulaUtils.toFixed(1.235, { rounding: 'FLOOR' })).toBe('1.23');
    expect(formulaUtils.toFixed('1.235', { rounding: 'FLOOR' })).toBe('1.23');
    expect(formulaUtils.toFixed(new Decimal(1.235), { rounding: 'FLOOR' })).toBe('1.23');

    expect(formulaUtils.toFixed(1.234, { precision: 0 })).toBe('1');
    expect(formulaUtils.toFixed('1.234', { precision: 0 })).toBe('1');
    expect(formulaUtils.toFixed(new Decimal(1.234), { precision: 0 })).toBe('1');
    expect(formulaUtils.toFixed(1.2, { precision: 0 })).toBe('1');
    expect(formulaUtils.toFixed(1234.567, { precision: -2 })).toBe('1235');
    expect(formulaUtils.toFixed(1234.5678, { precision: [2, 3] })).toBe('1234.568');
    expect(formulaUtils.toFixed(1234.56789, { precision: [2, 4] })).toBe('1234.5679');
    expect(formulaUtils.toFixed(1234.56, { precision: [2, 4] })).toBe('1234.56');
    expect(formulaUtils.toFixed(1234.5, { precision: [2, 4] })).toBe('1234.50');
    expect(formulaUtils.toFixed(1234, { precision: [2, 4] })).toBe('1234.00');


    expect(formulaUtils.toFixed(1, { comma: true })).toBe('1.00');
    expect(formulaUtils.toFixed(10, { comma: true })).toBe('10.00');
    expect(formulaUtils.toFixed(100, { comma: true })).toBe('100.00');
    expect(formulaUtils.toFixed(1_000, { comma: true })).toBe('1,000.00');
    expect(formulaUtils.toFixed(10_000, { comma: true })).toBe('10,000.00');
    expect(formulaUtils.toFixed(100_000, { comma: true })).toBe('100,000.00');
    expect(formulaUtils.toFixed(1_000_000, { comma: true })).toBe('1,000,000.00');
    expect(formulaUtils.toFixed(10_000_000, { comma: true })).toBe('10,000,000.00');
    expect(formulaUtils.toFixed(100_000_000, { comma: true })).toBe('100,000,000.00');

    expect(formulaUtils.toFixed(1, { comma: true, precision: 0 })).toBe('1');
    expect(formulaUtils.toFixed(10, { comma: true, precision: 0 })).toBe('10');
    expect(formulaUtils.toFixed(100, { comma: true, precision: 0 })).toBe('100');
    expect(formulaUtils.toFixed(1_000, { comma: true, precision: 0 })).toBe('1,000');
    expect(formulaUtils.toFixed(10_000, { comma: true, precision: 0 })).toBe('10,000');
    expect(formulaUtils.toFixed(100_000, { comma: true, precision: 0 })).toBe('100,000');
    expect(formulaUtils.toFixed(1_000_000, { comma: true, precision: 0 })).toBe('1,000,000');
    expect(formulaUtils.toFixed(10_000_000, { comma: true, precision: 0 })).toBe('10,000,000');
    expect(formulaUtils.toFixed(100_000_000, { comma: true, precision: 0 })).toBe('100,000,000');

    expect(formulaUtils.toFixed(1.234, { comma: true })).toBe('1.23');
    expect(formulaUtils.toFixed(10.234, { comma: true })).toBe('10.23');
    expect(formulaUtils.toFixed(100.234, { comma: true })).toBe('100.23');
    expect(formulaUtils.toFixed(1_000.234, { comma: true })).toBe('1,000.23');
    expect(formulaUtils.toFixed(10_000.234, { comma: true })).toBe('10,000.23');
    expect(formulaUtils.toFixed(100_000.234, { comma: true })).toBe('100,000.23');
    expect(formulaUtils.toFixed(1_000_000.234, { comma: true })).toBe('1,000,000.23');
    expect(formulaUtils.toFixed(10_000_000.234, { comma: true })).toBe('10,000,000.23');
    expect(formulaUtils.toFixed(100_000_000.234, { comma: true })).toBe('100,000,000.23');
    expect(formulaUtils.toFixed(1_000_000_000.234, { comma: true })).toBe('1,000,000,000.23');
    expect(formulaUtils.toFixed('1000000.234', { comma: true })).toBe('1,000,000.23');
    expect(formulaUtils.toFixed(new Decimal(1_000_000.234), { comma: true })).toBe('1,000,000.23');
    expect(formulaUtils.toFixed(1_000_000.2, { comma: true })).toBe('1,000,000.20');
    expect(formulaUtils.toFixed(1_000_000.2, { comma: true, commaStr: '_' })).toBe('1_000_000.20');
    expect(formulaUtils.toFixed(1_000_000.2, { comma: true, commaStr: '`', commaDigit: 4 })).toBe('100`0000.20');
    expect(formulaUtils.toFixed(1_000_000.2, { comma: true, commaStr: '' })).toBe('1000000.20');
    expect(formulaUtils.toFixed(1_000_000.2, { comma: true, commaDigit: 0 })).toBe('1000000.20');

    expect(formulaUtils.toFixed(-1_000_000.234, { comma: true })).toBe('-1,000,000.23');
    expect(formulaUtils.toFixed('-1000000.234', { comma: true })).toBe('-1,000,000.23');
    expect(formulaUtils.toFixed(new Decimal(-1_000_000.234), { comma: true })).toBe('-1,000,000.23');
    expect(formulaUtils.toFixed(-1_000_000.2, { comma: true })).toBe('-1,000,000.20');

    expect(formulaUtils.toFixed(null, { nullStr: '-' })).toBe('-');
    expect(formulaUtils.toFixed(undefined, { nullStr: '-' })).toBe('-');
    expect(formulaUtils.toFixed(NaN, { nullStr: '-' })).toBe('-');
    expect(formulaUtils.toFixed(Infinity, { nullStr: '-' })).toBe('-');
    expect(formulaUtils.toFixed('-', { nullStr: '-' })).toBe('-');
    expect(formulaUtils.toFixed('', { nullStr: '-' })).toBe('-');
    expect(formulaUtils.toFixed(new Decimal(NaN), { nullStr: '-' })).toBe('-');
    expect(formulaUtils.toFixed(new Decimal(Infinity), { nullStr: '-' })).toBe('-');

    expect(formulaUtils.toFixed(1)).toBe('1.00');
    expect(formulaUtils.toFixed(0)).toBe('0.00');

    expect(formulaUtils.toFixed(1.2, { trimTrailingZeroIfInt: true })).toBe('1.20');
    expect(formulaUtils.toFixed(1, { trimTrailingZeroIfInt: true })).toBe('1');
    expect(formulaUtils.toFixed(0, { trimTrailingZeroIfInt: true })).toBe('0');
    expect(formulaUtils.toFixed(0.1, { trimTrailingZeroIfInt: true })).toBe('0.10');

    expect(formulaUtils.toFixed(1.2, { trimTrailingZero: true })).toBe('1.2');
    expect(formulaUtils.toFixed(1, { trimTrailingZero: true })).toBe('1');
    expect(formulaUtils.toFixed(0, { trimTrailingZero: true })).toBe('0');
    expect(formulaUtils.toFixed(0.1, { trimTrailingZero: true })).toBe('0.1');
  });
});

