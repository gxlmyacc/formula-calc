import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import formulaCalc, {
  Formula, createParamsDataSource,
  createFormula
} from '../src';

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
    expect(formulaCalc('3.334', {
      precision: 2,
    })).toBe(3.33);
    expect(formulaCalc('NaN', {
      precision: 2,
    })).toBe(NaN);

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

    expect(formulaCalc('a.b + 1', {
      nullAsZero: true,
      params: {
        a: {
          b: ''
        }
      }
    })).toBe(1);

    let formula: Formula|null = null;
    const result1 = formulaCalc('1 + a', {
      params: {
        a: 1
      },
      onFormulaCreated: f => formula = f
    });
    const result2 = formula && formulaCalc(formula, {
      params: {
        a: 2
      },
    });
    expect([result1, result2]).toEqual([2, 3]);

    expect(formulaCalc(createFormula('a + 1'), {
      params: {
        a: 3
      },
    })).toBe(4);

    expect(formulaCalc(createFormula('1 + 1'))).toBe(2);
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

  test('cache', () => {
    expect(formulaCalc('1 + a', {
      params: {
        a: 1
      },
      cache: true,
    })).toBe(2);
    expect(formulaCalc('1 + a', {
      params: {
        a: 2
      },
      cache: true,
    })).toBe(3);
  });

  test('returnDecimal', () => {
    let result = formulaCalc('1', {

      returnDecimal: true
    });
    expect(Decimal.isDecimal(result)).toBe(true);

    expect(formulaCalc('"1"', {
      returnDecimal: true,
    })).toBe('1');

    result = formulaCalc('"1"', {
      returnDecimal: true,
      tryStringToNumber: true
    });
    expect(Decimal.isDecimal(result)).toBe(true);

    expect(formulaCalc('"1"', {
      tryStringToNumber: true
    })).toBe(1);


    result = formulaCalc('a', {
      params: {
        a: [1, 2, 3]
      },
      returnDecimal: true
    });
    expect(Array.isArray(result) && result.every(v => Decimal.isDecimal(v))).toBe(true);

    result = formulaCalc('a', {
      params: {
        a: [1, '2', 3]
      },
      returnDecimal: true
    });
    expect(Array.isArray(result) && result.every((v, i) => {
      if (i === 1) return v === '2';
      return Decimal.isDecimal(v);
    })).toBe(true);
  });

  test('returnReferenceType', () => {
    let result = formulaCalc('1 + 1', {}, 0);
    expect(result).toBe(2);

    result = formulaCalc('1 + 1', {}, (result: number) => result + 1);
    expect(result).toBe(3);
  });
});

