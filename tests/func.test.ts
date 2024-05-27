import { describe, expect, test } from '@jest/globals';
import Decimal from 'decimal.js';
import formulaCalc, { registorFormulaFunction } from '../src';

describe('function test', () => {
  test('abs', () => {
    expect(formulaCalc('abs(1)')).toBe(1);
    expect(formulaCalc('abs(-1)')).toBe(1);
    expect(formulaCalc('abs(-1.2)')).toBe(1.2);
    expect(formulaCalc('abs(10 / -3)')).toBe(3.3333333333333335);
    expect(formulaCalc('abs(10 / -3)', { precision: 2 })).toBe(3.33);
    expect(formulaCalc('abs(-10 / 2)')).toBe(5);
    expect(formulaCalc('abs(-1) + 1')).toBe(2);

    expect(formulaCalc('abs(a)', {
      params: {
        a: -1
      }
    })).toBe(1);
  });

  test('avg', () => {
    expect(formulaCalc('avg(1)')).toBe(1);
    expect(formulaCalc('avg(-1, 0, 1, 2, 3, 4, 5, 6)')).toBe(2.5);
    expect(formulaCalc('avg(-1, -1.2, 0, 1, 1.3)')).toBe(0.02);

    expect(formulaCalc('avg(3, 2, 1, 0, -1, a)', {
      params: {
        a: 5
      }
    })).toBe(1.6666666666666667);
    expect(formulaCalc('avg(3, 2, 1, 0, -1, a)', {
      precision: 2,
      params: {
        a: 5
      }
    })).toBe(1.67);
    expect(formulaCalc('avg(3, 2, 1, 0, -1, a)', {
      precision: 2,
      params: {
        a: [2, 3, 4, 5]
      }
    })).toBe(2.11);
    expect(formulaCalc('avg(3, 2, 1, 0, -1, a)', {
      precision: 2,
      params: {
        a: Promise.resolve([2, 3, 4, 5])
      }
    })).resolves.toBe(2.11);
  });

  test('eval', () => {
    expect(formulaCalc('eval("")')).toBe(null);
    expect(formulaCalc('eval(1)')).toBe(1);
    expect(formulaCalc('eval(0)')).toBe(0);
    expect(formulaCalc('eval(a)', {
      params: {
        a: '1 + 1'
      }
    })).toBe(2);
    expect(formulaCalc('eval(a)', {
      params: {
        a: '1 + 2 * 3'
      }
    })).toBe(7);
    expect(formulaCalc('eval(a) + add1(1)', {
      params: {
        a: '1 + 2 * 3 + add1(1)'
      },
      customFunctions: {
        add1: {
          argMin: 1,
          argMax: 1,
          execute(params, dataSource, options) {
            return params[0] + 1;
          }
        }
      }
    })).toBe(11);
    expect(() => formulaCalc('eval("1")', { eval: null })).toThrow('eval function is not supported!');
  });

  test('ceil', () => {
    expect(formulaCalc('ceil(2.11)')).toBe(3);
    expect(formulaCalc('ceil(2.49)')).toBe(3);
    expect(formulaCalc('ceil(2.51)')).toBe(3);
    expect(formulaCalc('ceil(2.00000000001)')).toBe(3);
    expect(formulaCalc('ceil(-2.000001)')).toBe(-2);
    expect(formulaCalc('ceil(-1.97)')).toBe(-1);
    expect(formulaCalc('ceil(9e-7)')).toBe(1);
  });

  test('exist', () => {
    expect(formulaCalc('exist(a, "b.c")', {
      params: {
        a: {
          c: 1
        }
      },
    })).toBe(false);
    expect(formulaCalc('exist(a, "b.c")', {
      params: {
        a: {
          b: {
            c: 1
          }
        }
      },
    })).toBe(true);
    expect(formulaCalc('exist(a, "b.c", "number")', {
      params: {
        a: {
          b: {
            c: 1
          }
        }
      },
    })).toBe(true);
    expect(formulaCalc('exist(a, "b.c", "string")', {
      params: {
        a: {
          b: {
            c: 1
          }
        }
      },
    })).toBe(false);
    expect(formulaCalc('exist(a, "b.c", "bool")', {
      params: {
        a: {
          b: {
            c: 1
          }
        }
      },
    })).toBe(false);
    expect(formulaCalc('exist(a, "b.c", "null")', {
      params: {
        a: {
          b: {
            c: 1
          }
        }
      },
    })).toBe(false);
    expect(formulaCalc('exist(a, "b.c", "object")', {
      params: {
        a: {
          b: {
            c: 1
          }
        }
      },
    })).toBe(false);
    expect(formulaCalc('exist(a, "b.c", "aaa")', {
      params: {
        a: {
          b: {
            c: 1
          }
        }
      },
    })).toBe(false);
    expect(formulaCalc('exist(null, "b.c")')).toBe(false);
    expect(formulaCalc('exist("", "b.c")')).toBe(false);
    expect(formulaCalc('exist(true, "b.c")')).toBe(false);
    expect(formulaCalc('exist(false, "b.c")')).toBe(false);
    expect(formulaCalc('exist(0, "b.c")')).toBe(false);
    expect(formulaCalc('exist(1, "b.c")')).toBe(false);
    expect(() => formulaCalc('exist(null, "")')).toThrow('Invalid parameter type: "key" is empty!');
    expect(() => formulaCalc('exist(null, 1)')).toThrow('Invalid parameter type: "key" is not string!');
    expect(() => formulaCalc('exist(null, true)')).toThrow('Invalid parameter type: "key" is not string!');
    expect(() => formulaCalc('exist(null, null)')).toThrow('Invalid parameter type: "key" is not string!');
  });

  test('floor', () => {
    expect(formulaCalc('floor(2.11)')).toBe(2);
    expect(formulaCalc('floor(2.49)')).toBe(2);
    expect(formulaCalc('floor(2.51)')).toBe(2);
    expect(formulaCalc('floor(2.00000000001)')).toBe(2);
    expect(formulaCalc('floor(-2.000001)')).toBe(-3);
    expect(formulaCalc('floor(-1.97)')).toBe(-2);
    expect(formulaCalc('floor(9e-7)')).toBe(0);
  });

  test('if', () => {
    expect(formulaCalc('if(true, 1, 2)')).toBe(1);
    expect(
      formulaCalc(`if(
        1,
        1,
        2
      )`)
    ).toBe(1);

    expect(formulaCalc(`if(
      (a + 2) > 0,
      $1,
      0 - $1
      )`, {
      params: {
        a: -3
      }
    })).toBe(1);
    expect(formulaCalc(
      `if(
        a > 0,
        eval(planA),
        eval(planB)
      )`, {
        params: {
          a: -3,
          planA: 'a + 1',
          planB: '0 - a + 1',
        }
      }
    )).toBe(4);

    expect(formulaCalc('if("a", 1, 2)')).toBe(1);
    expect(formulaCalc('if(false, 1, 2)')).toBe(2);
    expect(formulaCalc('if(0, 1, 2)')).toBe(2);
    expect(formulaCalc('if("", 1, 2)')).toBe(2);
  });

  test('max', () => {
    expect(formulaCalc('max(1)')).toBe(1);
    expect(formulaCalc('max(-1, 0, 1, 2, 3, 4, 5, 6)')).toBe(6);
    expect(formulaCalc('max(-1, -1.2, 0, 1, 1.3)')).toBe(1.3);

    expect(formulaCalc('max(3, 2, 1, 0, -1, a)', {
      params: {
        a: 5
      }
    })).toBe(5);
    expect(formulaCalc('max(3, 2, 1, 0, -1, a)', {
      params: {
        a: [2, 3, 4, 5]
      }
    })).toBe(5);
  });

  test('min', () => {
    expect(formulaCalc('min(1)')).toBe(1);
    expect(formulaCalc('min(-1, 0, 1, 2, 3, 4, 5, 6)')).toBe(-1);
    expect(formulaCalc('min(-1, -1.2, 0, 1, 1.3)')).toBe(-1.2);

    expect(formulaCalc('min(3, 2, 1, 0, -1, a)', {
      params: {
        a: -4
      }
    })).toBe(-4);
    expect(formulaCalc('min(3, 2, 1, 0, -1, a)', {
      params: {
        a: [2, 3, 4, 5, -100]
      }
    })).toBe(-100);
  });

  test('random', () => {
    expect(formulaCalc('random()')).toBeLessThan(1);
    expect(formulaCalc('random(5)')).toBeLessThan(1);
  });

  test('round', () => {
    expect(formulaCalc('round(2.111)')).toBe(2.11);
    expect(formulaCalc('round(2.491)')).toBe(2.49);
    expect(formulaCalc('round(2.495)')).toBe(2.5);
    expect(formulaCalc('round(2.00000000001)')).toBe(2);
    expect(formulaCalc('round(-2.000001)')).toBe(-2);
    expect(formulaCalc('round(-1.974)')).toBe(-1.97);
    expect(formulaCalc('round(9e-7)')).toBe(0);

    expect(formulaCalc('round(2.4945, 3)')).toBe(2.495);

    expect(formulaCalc('round(2.4945, 3)', {
      rounding: Decimal.ROUND_FLOOR
    })).toBe(2.494);
  });

  test('sqrt', () => {
    expect(formulaCalc('sqrt(16)')).toBe(4);
    expect(formulaCalc('sqrt(16) + 1')).toBe(5);
    expect(formulaCalc('sqrt(16) + 1 + a', {
      params: {
        a: 2
      }
    })).toBe(7);
    expect(formulaCalc('sqrt(-1)')).toBe(NaN);
  });

  test('sum', () => {
    expect(formulaCalc('sum(1)')).toBe(1);
    expect(formulaCalc('sum(-1, 0, 1, 2, 3, 4, 5, 6)')).toBe(20);
    expect(formulaCalc('sum(-1, -1.2, 0, 1, 1.3)')).toBe(0.1);

    expect(formulaCalc('sum(3, 2, 1, 0, -1, a)', {
      params: {
        a: 5
      }
    })).toBe(10);
    expect(formulaCalc('sum(3, 2, 1, 0, -1, a)', {
      params: {
        a: [2, 3, 4, 5]
      }
    })).toBe(19);
  });

  test('trunc', () => {
    expect(formulaCalc('trunc(2.11)')).toBe(2);
    expect(formulaCalc('trunc(2.49)')).toBe(2);
    expect(formulaCalc('trunc(2.51)')).toBe(2);
    expect(formulaCalc('trunc(2.00000000001)')).toBe(2);
    expect(formulaCalc('trunc(-2.000001)')).toBe(-2);
    expect(formulaCalc('trunc(-1.97)')).toBe(-1);
    expect(formulaCalc('trunc(9e-7)')).toBe(0);
  });

  test('custom', () => {
    expect(formulaCalc('add1(2.11)', {
      customFunctions: {
        add1: {
          argMin: 1,
          argMax: 1,
          execute(params, dataSource, options) {
            return params[0] + 1;
          }
        }
      }
    })).toBe(3.11);
    expect(formulaCalc('add_1(2.11)', {
      customFunctions: {
        add_1: {
          preExecute: false,
          argMin: 1,
          argMax: 1,
          execute(params, dataSource, options) {
            return params[0].execute(dataSource, options) + 1;
          }
        }
      }
    })).toBe(3.11);
    expect(() => formulaCalc('add1(2.11, 1)', {
      customFunctions: {
        add1: {
          argMin: 1,
          argMax: 1,
          execute(params, dataSource, options) {
            return params[0] + 1;
          }
        }
      }
    })).toThrow('"ADD1" invalid param count, expected: 1, actual: 2');

    expect(() => {
      registorFormulaFunction('add1', {
        argMin: 1,
        argMax: 1,
        execute(params, dataSource, options) {
          return params[0] + 1;
        }
      });
      registorFormulaFunction('add1', {
        argMin: 1,
        argMax: 1,
        execute(params, dataSource, options) {
          return params[0] + 1;
        }
      });
    }).toThrow('registor custom function fail: "add1" already exist!');
  });


  test('other', () => {
    expect(() => formulaCalc('some_method(111)')).toThrow('unsupported function: "some_method"');
  });
});

