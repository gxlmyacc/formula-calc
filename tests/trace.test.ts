import { expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import formulaCalc, { createFormula } from '../src';
import type { FormulaTraceDetails } from '../src';

test('trace details preserve exact values and record actual null and precision conversions', () => {
  const details: FormulaTraceDetails[] = [];
  const traced = (expression: string, options = {}) => formulaCalc(expression, {
    ...options,
    onTrace(item, value, detail) {
      details.push(detail!);
    },
  });
  for (const value of [null, undefined, '', NaN, new Decimal(NaN)]) {
    details.length = 0;
    expect(traced('a', { params: () => value, nullAsZero: true })).toBe(0);
    expect(details[0].transformations).toHaveLength(1);
    expect(details[0].transformations[0].type).toBe('nullAsZero');
    expect(String(details[0].transformations[0].after)).toBe('0');
  }
  details.length = 0;
  expect(traced('2.01 * 1', { stepPrecision: 1 })).toBe(2);
  expect(details[0].transformations).toEqual([]);
  const rounding = details[2].transformations[0];
  expect(rounding.type).toBe('stepPrecision');
  expect(String(rounding.before)).toBe('2.01');
  expect(rounding.after.toFixed(rounding.precision)).toBe('2.0');
  details.length = 0;
  expect(traced('round(2.019, 2)', { stepPrecision: 1 })).toBe(2.02);
  expect(details[2].transformations.map((change) => change.type)).toEqual(['round']);
  expect(details[2].transformations[0].after.toFixed(2)).toBe('2.02');
  details.length = 0;
  expect(traced('round(2.019, 2) * 1', { stepPrecision: 1 })).toBe(2);
  expect(details[details.length - 1].transformations[0].after.toFixed(1)).toBe('2.0');
  details.length = 0;
  expect(traced('2.01%', { stepPrecision: 1 })).toBe(0.02);
  expect(details[1].transformations[0].precision).toBe(3);
  expect(details[1].transformations[0].after.toFixed(3)).toBe('0.020');
  details.length = 0;
  expect(traced('round(2, 1)')).toBe(2);
  expect(details.every((detail) => !detail.transformations.length)).toBe(true);
  expect(traced('round(NaN, 1)')).toBeNaN();
  expect(details[details.length - 1].transformations).toEqual([]);
});

test('async and concurrent traces keep conversion records separate, without changing the existing numeric callback', async () => {
  const formula = createFormula('a * 1');
  const logs = [[], []] as FormulaTraceDetails[][];
  const results = await Promise.all([null, 1.239].map((value, index) => formulaCalc(formula, {
    params: { a: Promise.resolve(value) },
    nullAsZero: true,
    stepPrecision: 2,
    onTrace(item, result, details) {
      expect(typeof result).toBe('number');
      logs[index].push(details!);
    },
  })));
  expect(results).toEqual([0, 1.24]);
  expect(logs[0].find((detail) => detail.transformations.length)!.transformations[0].before).toBeNull();
  expect(logs[0][2].transformations).toEqual([]);
  expect(logs[1][1].transformations).toEqual([]);
  expect(String(logs[1][2].transformations[0].before)).toBe('1.239');
  expect(formulaCalc('a * 1', {
    params: { a: new Decimal('123456789.123456789') },
    onTrace(item, result, details) {
      if (item.name === 'a') {
        expect(details!.value.toString()).toBe('123456789.123456789');
        expect(result).toBe(123456789.12345679);
      }
    },
  })).toBe(123456789.12345679);
});
