import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import formulaCalc, {
  Formula, createParamsDataSource,
  createFormula,
} from '../src';
import FormulaParam from '../src/formula/values/param';

describe('formula test', () => {
  test('formula options', () => {
    expect(formulaCalc('sum(1.141, 1.141, a)', {
      precision: 2,
      params: {
        a: [1.141, 1.141, 1.141]
      }
    })).toBe(5.71);

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
      onFormulaCreated: (f) => formula = f
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

  test('stepPrecision', () => {
    expect(formulaCalc('3.334 + 3.335', {
      precision: 2,
      stepPrecision: true,
    })).toBe(6.67);
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
    expect(formulaCalc('max(a * b - a * c, 0)', {
      params: {
        a: 4500.22,
        b: 0.2,
        c: 0.075
      }
    })).toBe(562.5275);

    expect(formulaCalc('max(a * b - a * c, 0)', {
      precision: 2,
      params: {
        a: 4500.22,
        b: 0.2,
        c: 0.075
      }
    })).toBe(562.53);

    expect(formulaCalc('max(a * b - a * c, 0)', {
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 0.2,
        c: 0.075
      }
    })).toBe(540.02);

    expect(formulaCalc('max(a * b - a * c%, 0)', {
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 0.2,
        c: 7.5
      }
    })).toBe(540.02);

    expect(formulaCalc('max(a * b% - a * c%, 0)', {
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 20,
        c: 7.5
      }
    })).toBe(540.02);

    expect(formulaCalc('max(a * b - a * c, 0)', {
      ignoreRoundingParams: (name) => name === 'c',
      stepPrecision: (item) => ((item as FormulaParam).name === 'c' ? 3 : 2),
      params: {
        a: 4500.22,
        b: 0.2,
        c: 0.075
      }
    })).toBe(562.52);

    expect(formulaCalc('max(a * b - a * c, 0)', {
      ignoreRoundingOriginalValue: true,
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 0.2,
        c: 0.075
      }
    })).toBe(562.52);

    expect(formulaCalc('max(a * b - a * c%, 0)', {
      ignoreRoundingOriginalValue: true,
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 0.2,
        c: 7.5
      }
    })).toBe(562.52);

    expect(formulaCalc('max(a * b - a * c, 0)', {
      ignoreRoundingParams: true,
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 0.2,
        c: 0.075
      }
    })).toBe(562.52);

    expect(formulaCalc('max(a * b - a * c, 0)', {
      ignoreRoundingParams: (name) => name === 'c',
      stepPrecision: 2,
      params: {
        a: 4500.22,
        b: 0.2,
        c: 0.075
      }
    })).toBe(562.52);
  });

  test('registerFunction', () => {
    const formula = new Formula();
    formula.registerFunction('add1', {
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
    expect(Array.isArray(result) && result.every((v) => Decimal.isDecimal(v))).toBe(true);

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

  test('onTrace', () => {
    let executed: Array<[string, any]> = [];
    let expression = '';
    let result = formulaCalc('1 + 1', {
      onTrace(item, value) {
        executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
      }
    });
    expect(result).toBe(2);
    expect(executed).toEqual([
      ['[1, 1]: 1', 1],
      ['[1, 5]: 1', 1],
      ['[1, 1]: 1 + 1', 2]
    ]);

    executed = [];
    result = formulaCalc('(1 + 1)', {
      onTrace(item, value) {
        executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
      }
    });
    expect(result).toBe(2);
    expect(executed).toEqual([
      ['[1, 2]: 1', 1],
      ['[1, 6]: 1', 1],
      ['[1, 2]: 1 + 1', 2],
      ['[1, 1]: (1 + 1)', 2]
    ]);

    executed = [];
    result = formulaCalc('sum(1, 1)', {
      onTrace(item, value) {
        executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
      }
    });
    expect(result).toBe(2);
    expect(executed).toEqual([
      ['[1, 5]: 1', 1],
      ['[1, 8]: 1', 1],
      ['[1, 1]: sum(1, 1)', 2]
    ]);

    executed = [];
    expression = `sum(
1,
1
)`;
    result = formulaCalc(
      expression,
      {
        onTrace(item, value) {
          executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
        }
      }
    );
    expect(result).toBe(2);
    expect(executed).toEqual([
      ['[2, 1]: 1', 1],
      ['[3, 1]: 1', 1],
      [`[1, 1]: ${expression}`, 2]
    ]);

    const str1 = `张
    三`;
    executed = [];
    expression = `false ? "${str1}"
: "李四"`;
    result = formulaCalc(
      expression,
      {
        onTrace(item, value) {
          executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
        }
      }
    );
    expect(result).toBe('李四');
    expect(executed).toEqual([
      ['[1, 1]: false', false],
      ['[3, 3]: "李四"', '李四'],
      [`[1, 1]: false ? "${str1}" : "李四"`, '李四']
    ]);

    executed = [];

    expression = `true ? "${str1}"
: "李四"`;
    result = formulaCalc(
      expression,
      {
        onTrace(item, value) {
          executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
        }
      }
    );
    expect(result).toBe(str1);
    expect(executed).toEqual([
      ['[1, 1]: true', true],
      [`[1, 8]: "${str1}"`, str1],
      [`[1, 1]: true ? "${str1}" : "李四"`, str1]
    ]);

    executed = [];
    result = formulaCalc('1%', {
      onTrace(item, value) {
        executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
      }
    });
    expect(result).toBe(0.01);
    expect(executed).toEqual([
      ['[1, 1]: 1', 1],
      ['[1, 1]: 1%', 0.01],
    ]);

    executed = [];
    result = formulaCalc('!1', {
      onTrace(item, value) {
        executed.push([`[${item.line}, ${item.column}]: ${item.origText}`, value]);
      }
    });
    expect(result).toBe(false);
    expect(executed).toEqual([
      ['[1, 2]: 1', 1],
      ['[1, 1]: !1', false],
    ]);
  });
});

