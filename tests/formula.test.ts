import { describe, expect, test } from '@jest/globals';
import formulaCalc, { Formula, createParamsDataSource } from '../src';

describe('formula test', () => {
  test('formula options', () => {
    expect(formulaCalc('3.334 + 3.335', {
      precision: 2,
      stepPrecision: true,
    })).toBe(6.67);
    expect(formulaCalc('sum(1.141, 1.141, a)', {
      precision: 2,
      params: {
        a: [1.141, 1.141, 1.141]
      }
    })).toBe(5.71);
    expect(formulaCalc('sum(1.141, 1.141, a)', {
      precision: 2,
      stepPrecision: true,
      params: {
        a: [1.141, 1.141, 1.141]
      }
    })).toBe(5.7);
    expect(formulaCalc('3.3334 + 3.3315', {
      precision: 2,
      stepPrecision: 3,
    })).toBe(6.67);

    expect(formulaCalc('null + 1', {
      nullAsZero: true,
    })).toBe(1);

    expect(formulaCalc('sqrt(-1) + 1', {
      nullAsZero: true,
    })).toBe(1);

    expect(formulaCalc('a + 1', {
      nullAsZero: true,
      params(name, options) {
        if (name === 'a') {
          return 1;
        }
        return 0;
      }
    })).toBe(2);


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

  test('registorFunction', () => {
    const formula = new Formula();
    formula.registorFunction('add1', {
      argMin: 1,
      argMax: 1,
      execute(params, dataSource, options) {
        return params[0] + 1;
      }
    });
    formula.parse('1 + add1(1)');
    expect(formula.execute()).toBe(3);
  });

  test('dataSource', () => {
    expect(formulaCalc('a.b + 1', {
      dataSource: createParamsDataSource({
        a: {
          b: 1
        }
      })
    })).toBe(2);
  });
});

