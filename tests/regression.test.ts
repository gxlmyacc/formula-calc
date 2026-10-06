import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import formulaCalc, { createFormula, FormulaParamValue, formulaUtils } from '../src';

describe('execution regressions', () => {
  test('forward references use current values in reused, cached and batch formulas', () => {
    const formula = createFormula('$1 + (a)');
    expect(formulaCalc(formula, { params: { a: 1 } })).toBe(2);
    expect(formulaCalc(formula, { params: { a: 2 } })).toBe(4);
    expect(formulaCalc('$1 + (a)', { params: [{ a: 1 }, { a: 2 }, { a: 3 }] })).toEqual([2, 4, 6]);
    expect(formulaCalc('$1 + (a)', { cache: true, params: { a: 1 } })).toBe(2);
    expect(formulaCalc('$1 + (a)', { cache: true, params: { a: 2 } })).toBe(4);
  });

  test('async parentheses preserve scalar results and arithmetic', async () => {
    await expect(formulaCalc('(a)', { params: { a: Promise.resolve(2) } })).resolves.toBe(2);
    await expect(formulaCalc('(a) + 1', { params: { a: Promise.resolve(2) } })).resolves.toBe(3);
    await expect(formulaCalc('((a))', { params: { a: Promise.resolve(2) } })).resolves.toBe(2);
  });

  test.each(['(a) + $1', '$1 + (a)'])('async references: %s', async (expression) => {
    await expect(formulaCalc(expression, { params: { a: Promise.resolve(2) } })).resolves.toBe(4);
  });

  test('concurrent executions keep reference results isolated', async () => {
    const formula = createFormula('(a) + $1');
    let resolveFirst!: (value: number) => void;
    const firstParam = new Promise<number>((resolve) => {
      resolveFirst = resolve;
    });
    const first = formulaCalc<Promise<number>>(formula, { params: { a: firstParam } });
    const second = formulaCalc<Promise<number>>(formula, { params: { a: Promise.resolve(3) } });
    await expect(second).resolves.toBe(6);
    resolveFirst(2);
    await expect(first).resolves.toBe(4);
  });

  test('async batch references are isolated', async () => {
    const results = formulaCalc<Promise<number>[]>('$1 + (a)', {
      params: [{ a: Promise.resolve(1) }, { a: Promise.resolve(2) }, { a: Promise.resolve(3) }],
    });
    await expect(Promise.all(results)).resolves.toEqual([2, 4, 6]);
  });

  test('real circular references still fail synchronously and asynchronously', async () => {
    expect(() => formulaCalc('(1 + $1)')).toThrow('circular reference');
    await expect(formulaCalc('(a ? $1 : 0)', { params: { a: Promise.resolve(true) } }))
      .rejects.toThrow('circular reference');
  });

  test('a rejected execution does not contaminate the next one', async () => {
    const formula = createFormula('(a) + $1');
    await expect(formulaCalc(formula, { params: { a: Promise.reject(new Error('failed')) } })).rejects.toThrow('failed');
    await expect(formulaCalc(formula, { params: { a: Promise.resolve(2) } })).resolves.toBe(4);
  });
});

describe('cache regressions', () => {
  test.each(['constructor', 'toString', '__proto__'])('prototype keys are valid parameter names: %s', (name) => {
    expect(formulaCalc(name, { cache: true, params: { [name]: 7 } })).toBe(7);
  });

  test('custom functions belong to each call, including mutated definitions', () => {
    const customFunctions = { f: { argMin: 1, argMax: 1, execute: ([x]: number[]) => x + 1 } };
    expect(formulaCalc('f(1)', { cache: true, customFunctions })).toBe(2);
    customFunctions.f.execute = ([x]) => x + 10;
    expect(formulaCalc('f(1)', { cache: true, customFunctions })).toBe(11);
    expect(formulaCalc('f(1)', {
      cache: true,
      customFunctions: { f: { argMin: 1, argMax: 1, execute: () => 99 } },
    })).toBe(99);
    expect(() => formulaCalc('f(1)', { cache: true })).toThrow();
  });

  test('parameter creation hooks belong to each call', () => {
    expect(formulaCalc('hookParam', {
      cache: true, onCreateParam: (token, options) => new FormulaParamValue(token, 2, options),
    })).toBe(2);
    expect(formulaCalc('hookParam', {
      cache: true, onCreateParam: (token, options) => new FormulaParamValue(token, 3, options),
    })).toBe(3);
  });
});

describe('formatting regressions', () => {
  test.each(['9007199254740993', '-9007199254740993', '9007199254740993.125'])('preserves exact decimal strings: %s', (value) => {
    expect(formulaUtils.toFixed(value, { precision: 3 })).toBe(new Decimal(value).toFixed(3));
  });

  test.each([1.001, -1.001, 0.001, 1.999])('removes the decimal point after rounding %s to an integer', (value) => {
    expect(formulaUtils.toFixed(value, { trimTrailingZero: true })).toBe(new Decimal(value).toFixed(2).replace(/\.00$/, ''));
  });
});
