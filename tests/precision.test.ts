import { describe, expect, test, jest } from '@jest/globals';
import Decimal from 'decimal.js';
import formulaCalc, { createFormula, createToken, FormulaParamValue, getFormulaFunctionDefinitions } from '../src';
import { resolveValue } from '../src/formula/base/value';

describe('computation precision', () => {
  test('original and parameter policies remain configurable and independent', () => {
    expect(formulaCalc('1.234 * 100', { stepPrecision: 2, ignoreRoundingOriginalValue: false })).toBe(123);
    expect(formulaCalc('a * 100', { stepPrecision: 2, ignoreRoundingParams: false, params: { a: 1.234 } })).toBe(123);
    const ignoreRoundingParams = jest.fn((name: string) => name === 'b');
    expect(formulaCalc('a * 100 + b', {
      stepPrecision: 2,
      ignoreRoundingOriginalValue: true,
      ignoreRoundingParams,
      params: { a: 1.234, b: 1.234 }
    })).toBe(124.234);
    expect(ignoreRoundingParams.mock.calls.map(([name]) => name)).toEqual(['a', 'b']);
    expect(formulaCalc('a * 100', {
      stepPrecision: 2,
      ignoreRoundingOriginalValue: false,
      ignoreRoundingParams: true,
      params: { a: 1.234 }
    })).toBe(123.4);
  });

  test('function definitions share the effective registry and reflect custom overrides', () => {
    expect(getFormulaFunctionDefinitions()).toContainEqual({ name: 'clamp', argMin: 3, argMax: 3 });
    const functions = getFormulaFunctionDefinitions({
      max: { argMin: 1, argMax: 1, execute: () => 0 },
      newMethod: { argMin: 0, argMax: 2, execute: () => 0 },
    });
    expect(functions).toContainEqual({ name: 'max', argMin: 1, argMax: 1 });
    expect(functions).toContainEqual({ name: 'newMethod', argMin: 0, argMax: 2 });
  });
  test('parameter rounding callbacks are inactive when step rounding is disabled', () => {
    const ignoreRoundingParams = jest.fn(() => false);
    expect(formulaCalc('a', { ignoreRoundingParams, params: { a: 1.234 } })).toBe(1.234);
    expect(ignoreRoundingParams).not.toHaveBeenCalled();
  });
  test.each([
    ['1.234 * 100', 123.4], ['a * 100', 123.4], ['1.004 + 1.004', 2.008],
    ['sum(1.004, 1.004)', 2.008], ['max(1.234, 1.235)', 1.235],
    ['min(1.234, 1.235)', 1.234], ['abs(-1.234)', 1.234],
    ['clamp(1.234, 0, 2)', 1.234], ['round(1.2345, 3)', 1.235],
    ['1.234 % 1', 0.234], ['1.234 // 1', 1], ['1.234 - 1', 0.234],
    ['(1.234)', 1.234], ['if(true, 1.234, 5)', 1.234], ['number("1.234")', 1.234],
    ['avg(1.234, 1.235)', 1.23], ['sqrt(2)', 1.41], ['2 ^ 0.5', 1.41],
    ['2.01%', 0.0201], ['2.015%', 0.0202], ['0.01%', 0.0001],
    ['(2.01 + 0.005)%', 0.0202], ['-2.015%', -0.0202], ['a%', 0.0123],
  ])('%s preserves operands and rounds eligible results', (expression, expected) => {
    expect(formulaCalc(expression, { stepPrecision: 2, params: { a: 1.234 } })).toBe(expected);
  });

  test('zero precision, final precision, rounding modes and percent bypass', () => {
    expect(formulaCalc('1.5 * 1', { stepPrecision: 0 })).toBe(2);
    expect(formulaCalc('1.5%', { stepPrecision: 0 })).toBe(0.02);
    expect(formulaCalc('1.239 * 1', { stepPrecision: 2, rounding: 'DOWN' })).toBe(1.23);
    expect(formulaCalc('sum(1.004, 1.004)', { stepPrecision: 2, precision: 2 })).toBe(2.01);
    expect(formulaCalc('2.015%', { stepPrecision: 2, stepPrecisionIgnorePercent: true })).toBe(0.02015);
    expect(formulaCalc('2.01%', { stepPrecision: 2, precision: 2 })).toBe(0.02);
    expect(formulaCalc('1 / 3', { stepPrecision: true })).toBe(0.33);
    expect(formulaCalc('1 / 3', { stepPrecision: true, precision: 3 })).toBe(0.333);
    expect(formulaCalc('1 / 3', { stepPrecision: false })).toBeCloseTo(1 / 3, 15);
  });

  test('callback only observes eligible computation nodes and actual numeric ratios', () => {
    const observed: string[] = [];
    const stepPrecision = jest.fn((item: any, value) => {
      observed.push(item.origText);
      return item.token.token === '%' ? 2 : false;
    });
    expect(formulaCalc('max(2.015%, a * 1)', { stepPrecision, params: { a: 0.012345 } })).toBe(0.0202);
    expect(observed).toEqual(['2.015%', 'a * 1']);
    expect((stepPrecision.mock.calls as any)[0][1].toString()).toBe('0.02015');
  });

  test('custom functions opt out independently of arithmetic and support async results', async () => {
    const customFunctions = {
      keep: { argMin: 1, argMax: 1, useStepPrecision: false, arithmetic: true, execute: (args: any[]) => args[0] },
      compute: { argMin: 1, argMax: 1, execute: (args: any[]) => Promise.resolve(args[0]) },
      text: { argMin: 0, argMax: 0, execute: () => '1.234' },
      nil: { argMin: 0, argMax: 0, execute: () => null },
    };
    expect(formulaCalc('keep(1.234)', { stepPrecision: 2, customFunctions })).toBe(1.234);
    await expect(formulaCalc('compute(1.234)', { stepPrecision: 2, customFunctions })).resolves.toBe(1.23);
    expect(formulaCalc('text()', { stepPrecision: 2, customFunctions })).toBe('1.234');
    expect(formulaCalc('text()', { stepPrecision: 2, tryStringToNumber: true, customFunctions })).toBe(1.23);
    expect(formulaCalc('nil()', { stepPrecision: 2, customFunctions })).toBeNull();
    expect(formulaCalc('text()', {
      stepPrecision: 2,
      customFunctions: {
        ...customFunctions, text: { ...customFunctions.text, execute: () => new Decimal('1.234') },
      }
    })).toBe(1.23);
  });

  test('cached, batch, referenced and asynchronous operands retain their precision', async () => {
    const options = { stepPrecision: 2, cache: true };
    expect(formulaCalc('a * 100', { ...options, params: [{ a: 1.234 }, { a: 1.235 }] })).toEqual([123.4, 123.5]);
    await expect(formulaCalc('a * 100', { ...options, params: { a: Promise.resolve(1.234) } })).resolves.toBe(123.4);
    expect(formulaCalc('(1.234) * 100 + $1', options)).toBe(124.634);
    const formula = createFormula('1.234 * 100');
    expect(formulaCalc(formula, options)).toBe(123.4);
    expect(formulaCalc(formula, options)).toBe(123.4);
    expect(formulaCalc('123456789.123456789 * 1', { returnDecimal: true }).toString()).toBe('123456789.123456789');
  });

  test('numeric resolution outside nodes does not apply step rounding', () => {
    expect(resolveValue(1.234, { stepPrecision: 2 }, undefined as any).toString()).toBe('1.234');
    const item = new FormulaParamValue(createToken('a', 0), 'x', {});
    expect(resolveValue('x', {}, item)).toBe('x');
    expect(resolveValue('x', { tryStringToNumber: true }, item)).toBe('x');
  });
});

