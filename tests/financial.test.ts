import { describe, expect, test, jest } from '@jest/globals';
import Decimal from 'decimal.js';
import formulaCalc, { createFormula, getFormulaFunctionDefinitions } from '../src';

describe('financial functions', () => {
  // Published Microsoft examples, independently rounded to the displayed currency precision.
  test.each([
    ['fv(6% / 12, 10, -200, -500, 1)', 2581.4],
    ['fv(12% / 12, 12, -1000)', 12682.5],
    ['pv(8% / 12, 20 * 12, 500)', -59777.15],
    ['pmt(8% / 12, 10, 10000)', -1037.03],
    ['pmt(8% / 12, 10, 10000, 0, 1)', -1030.16],
    ['nper(12% / 12, -100, -1000, 10000, 1)', 59.67],
    ['ipmt(10% / 12, 1, 3 * 12, 8000)', -66.67],
    ['ipmt(10%, 3, 3, 8000)', -292.45],
    ['ppmt(10% / 12, 1, 2 * 12, 2000)', -75.62],
    ['npv(10%, flows)', 1188.44],
  ])('%s matches the reference example', (expression, expected) => {
    expect(formulaCalc(expression, { precision: 2, params: { flows: [-10000, 3000, 4200, 6800] } })).toBe(expected);
  });

  test.each([
    ['fv(0, 10, -100, -500)', 1500], ['pv(0, 10, -100, -500)', 1500],
    ['pmt(0, 10, 1000, 100)', -110], ['nper(0, -100, 1000, 100)', 11],
    ['ipmt(0, 1, 10, 1000)', 0], ['ppmt(0, 10, 10, 1000)', -100],
    ['ipmt(1%, 1, 10, 1000, 0, 1)', 0],
    ['fv(5%, 0, -100, -500)', 500], ['pv(5%, 0, -100, -500)', 500],
  ])('%s handles zero rates, zero periods and the first advance payment', (expression, value) => {
    expect(formulaCalc(expression)).toBe(value);
  });

  test('annuity inverses and amortization identities hold for both timings and nonzero future balances', () => {
    const D = Decimal.clone({ precision: 50 });
    for (const rate of [0, 0.01, -0.01, 1e-30]) {
      for (const type of [0, 1]) {
        const params = { rate, type, n: 24, principal: 10000, future: 250 };
        const options = { params, Decimal: D, returnDecimal: true };
        const pmt = formulaCalc('pmt(rate, n, principal, future, type)', options);
        expect(formulaCalc('fv(rate, n, pmt(rate, n, principal, future, type), principal, type)', options)
          .sub(250).abs().lt('1e-15')).toBe(true);
        expect(formulaCalc('pv(rate, n, pmt(rate, n, principal, future, type), future, type)', options)
          .sub(10000).abs().lt('1e-15')).toBe(true);
        expect(formulaCalc('nper(rate, pmt(rate, n, principal, future, type), principal, future, type)', options)
          .sub(24).abs().lt('1e-15')).toBe(true);
        for (const per of [1, 2, 12, 24]) {
          const parts = formulaCalc('ipmt(rate, per, n, principal, future, type) + ppmt(rate, per, n, principal, future, type)', {
            ...options, params: { ...params, per },
          });
          expect(parts.sub(pmt).abs().lt('1e-15')).toBe(true);
        }
      }
    }
    expect(D.precision).toBe(50);
  });

  test('NPV discounts the first flow once, preserves zero periods and validates each array item', () => {
    expect(formulaCalc('npv(10%, flows)', { params: { flows: [110, 121] } })).toBe(200);
    expect(formulaCalc('npv(0, flows)', { params: { flows: [0, -100, 120] } })).toBe(20);
    expect(formulaCalc('npv(-50%, flows)', { params: { flows: [1, 1] } })).toBe(6);
    expect(formulaCalc('npv(0, flows)', { params: { flows: ['10', '20'] }, tryStringToNumber: true })).toBe(30);
    expect(formulaCalc('npv(0, flows)', {
      params: { flows: [null, undefined, '', NaN, new Decimal(NaN), new Decimal(2), 3] }, nullAsZero: true,
    })).toBe(5);
    for (const flows of [[], 1, [[1]], ['10'], [Infinity], [null], [true], ['bad']]) {
      expect(() => formulaCalc('npv(0, flows)', { params: { flows } })).toThrow('[npv]');
    }
  });

  test.each([
    'pmt(-1, 10, 1000)', 'fv(-2, 10, -100)', 'pmt(0, 0, 1000)', 'ipmt(0, 0, 10, 1000)',
    'ppmt(1%, 11, 10, 1000)', 'ipmt(1%, 1.5, 10, 1000)', 'pv(1%, -1, 100)',
    'fv(1%, 10, -100, 0, 2)', 'pmt("bad", 10, 1000)', 'pmt(true, 10, 1000)',
    'pmt(1%, 10, 1000, 0, -1)', 'nper(0, 0, 1000)', 'nper(0, 100, 1000)',
    'nper(10%, -100, 1000)', 'nper(10%, 100, 1000, 1000)', 'nper(10%, 100, -1000, 0)',
    'nper(10%, 0, 1000)', 'nper(1e-2000, -100, 1000)', 'nper(10%, 100, 1000, 2000)',
    'fv(1%, 100000000000000000000, -100)', 'pmt(1e-2000, 10, 1000)',
  ])('%s reports invalid or unsolvable inputs', (expression) => {
    expect(() => formulaCalc(expression)).toThrow();
  });

  test('defaults, fractions, high precision, null policies and numeric strings follow the existing options', () => {
    expect(formulaCalc('nper(0, -100, 1000)')).toBe(10);
    expect(formulaCalc('pmt(1e-50, 10, 1000)')).toBe(-100);
    expect(formulaCalc('fv(10%, 0.5, 0, -100)')).toBeCloseTo(104.880884817, 8);
    expect(formulaCalc('pmt(rate, 10, amount)', { params: { rate: '0', amount: '1000' }, tryStringToNumber: true })).toBe(-100);
    expect(() => formulaCalc('pmt(0, 10, amount)', { params: { amount: '1000' } })).toThrow('finite number');
    expect(() => formulaCalc('pmt(0, 10, amount)', { params: { amount: Infinity } })).toThrow('finite number');
    expect(formulaCalc('fv(0, 10, payment, principal)', { params: {}, nullAsZero: true })).toBe(0);
    expect(formulaCalc('pv(0, 0, 0, value)', { params: { value: new Decimal('9007199254740993') }, returnDecimal: true }).toString())
      .toBe('-9007199254740993');
    expect(() => formulaCalc('pmt(0, 10)')).toThrow('invalid param count');
    expect(getFormulaFunctionDefinitions()).toContainEqual({ name: 'ipmt', argMin: 4, argMax: 6 });
  });

  test('step rounding applies only at function boundaries and honors rounding and parameter policies', () => {
    const stepPrecision = jest.fn(() => 2);
    expect(formulaCalc('pmt(0, 3, 100)', { stepPrecision })).toBe(-33.33);
    expect(stepPrecision.mock.calls).toHaveLength(1);
    expect(formulaCalc('ppmt(1%, 2, 10, 1000)', { stepPrecision: 2 })).toBe(-96.54);
    expect(formulaCalc('pmt(0, 3, 100)', { stepPrecision: 0, rounding: 'DOWN' })).toBe(-33);
    expect(formulaCalc('pmt(0, 1, value)', { params: { value: 1.239 }, stepPrecision: 2, ignoreRoundingParams: () => false })).toBe(-1.24);
    expect(formulaCalc('fv(0, 1, -1.239)', { stepPrecision: 2, ignoreRoundingOriginalValue: false })).toBe(1.24);
  });

  test('asynchronous parameters, batch rows, references and repeated concurrent evaluation remain independent', async () => {
    await expect(formulaCalc('pmt(rate, n, amount)', {
      params: { rate: Promise.resolve(0), n: Promise.resolve(10), amount: Promise.resolve(1000) },
    })).resolves.toBe(-100);
    await expect(formulaCalc('npv(0, flows)', { params: { flows: Promise.resolve([1, 2]) } })).resolves.toBe(3);
    expect(formulaCalc('(pmt(0, 10, amount)) + $1', { params: [{ amount: 1000 }, { amount: 2000 }] })).toEqual([-200, -400]);
    const formula = createFormula('pmt(rate, 10, amount)');
    const results = await Promise.all([1000, 2000, 3000].map((amount) => formulaCalc(formula, {
      params: { rate: Promise.resolve(0), amount: Promise.resolve(amount) },
    })));
    expect(results).toEqual([-100, -200, -300]);
    await expect(formulaCalc('pmt(rate, 10, 1000)', { params: { rate: Promise.resolve(-1) } })).rejects.toThrow('rate');
  });
});
