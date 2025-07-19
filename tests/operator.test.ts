import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('operator test', () => {
  test('add', () => {
    expect(formulaCalc('1 + 1')).toBe(2);
    expect(formulaCalc('0.1 + 0.2')).toBe(0.3);
    expect(formulaCalc(' 1 + 1 + 1.1')).toBe(3.1);
    expect(formulaCalc(' 1 + (1 + 1)')).toBe(3);
    expect(formulaCalc(' -1.1 + 1')).toBe(-0.1);
    expect(formulaCalc('2% + 1')).toBe(1.02);
    expect(formulaCalc('1 + \n\r 1')).toBe(2);
    expect(formulaCalc(' -1.1 + 1 + a', {
      params: {
        a: 2
      }
    })).toBe(1.9);
    expect(formulaCalc(' -1.1 + 1 + a.b', {
      params: {
        a: {
          b: 2
        }
      }
    })).toBe(1.9);
    expect(formulaCalc(' -1.1 + 1 + a.b', {
      params: {
        a: {
          b: Promise.resolve(2)
        }
      }
    })).resolves.toBe(1.9);

    expect(formulaCalc('1 + "1"')).toBe(2);
    expect(formulaCalc('"1" + 1')).toBe(2);
    expect(formulaCalc('1 + "1"', { tryStringToNumber: true })).toBe(2);
    expect(formulaCalc('1 + null', { nullAsZero: true })).toBe(1);
    expect(formulaCalc('1 + ""', { nullAsZero: true })).toBe(1);
    expect(formulaCalc('1 + NaN', { nullAsZero: true })).toBe(1);
  });

  test('sub', () => {
    expect(formulaCalc('1 - 1')).toBe(0);
    expect(formulaCalc(' 1 - 1 - 1.1')).toBe(-1.1);
    expect(formulaCalc(' 1 - (1 - 2)')).toBe(2);
    expect(formulaCalc(' -1.1 - 1')).toBe(-2.1);
    expect(formulaCalc(' -1.1 - 1 + a', {
      params: {
        a: 2
      }
    })).toBe(-0.1);
    expect(formulaCalc(' -1.1 - 1 + a', {
      params: {
        a: Promise.resolve(2)
      }
    })).resolves.toBe(-0.1);
  });

  test('mul', () => {
    expect(formulaCalc('6 * 3')).toBe(18);
    expect(formulaCalc(' 5 * 4 * 1.1')).toBe(22);
    expect(formulaCalc(' 5 + 4 * 1.1')).toBe(9.4);
    expect(formulaCalc(' 1 + (5 * 3)')).toBe(16);
    expect(formulaCalc(' 1 + 5 * 3')).toBe(16);
    expect(formulaCalc(' (1 + 5) * 3')).toBe(18);
    expect(formulaCalc(' -1.1 * 6')).toBe(-6.6);
    expect(formulaCalc('(1 + 1) * (1 + 1)')).toBe(4);
    expect(formulaCalc(' -1.1 * 4 + a', {
      params: {
        a: 2
      }
    })).toBe(-2.4);
  });

  test('div', () => {
    expect(formulaCalc('6 / 3')).toBe(2);
    expect(formulaCalc(' 5 / 4 / 2')).toBe(0.625);
    expect(formulaCalc(' 5 + 4 / 2')).toBe(7);
    expect(formulaCalc(' 1 + (5 / 2)')).toBe(3.5);
    expect(formulaCalc(' 1 + 5 / 2')).toBe(3.5);
    expect(formulaCalc(' (1 + 5) / 3')).toBe(2);
    expect(formulaCalc(' -1.1 / 2')).toBe(-0.55);
    expect(formulaCalc(' -1.1 / 4 + a', {
      params: {
        a: 2
      }
    })).toBe(1.725);
  });

  test('divInt', () => {
    expect(formulaCalc('6 // 3')).toBe(2);
    expect(formulaCalc(' 5 // 4 // 2')).toBe(0);
    expect(formulaCalc(' 5 + 4 // 2')).toBe(7);
    expect(formulaCalc(' 1 + (5 // 2)')).toBe(3);
    expect(formulaCalc(' 1 + 5 // 2')).toBe(3);
    expect(formulaCalc(' (1 + 5) // 3')).toBe(2);
    expect(formulaCalc(' -1.1 // 6')).toBe(0);
    expect(formulaCalc(' 1.1 // 6')).toBe(0);
  });

  test('mod', () => {
    expect(formulaCalc('6 % 3')).toBe(0);
    expect(formulaCalc(' 5 % 4 % 2')).toBe(1);
    expect(formulaCalc(' 5 + 4 % 2')).toBe(5);
    expect(formulaCalc(' 1 + (5 % 2)')).toBe(2);
    expect(formulaCalc(' 1 + 5 % 2')).toBe(2);
    expect(formulaCalc(' (1 + 5) % 3')).toBe(0);
    expect(formulaCalc(' 7 % 2')).toBe(1);
    expect(formulaCalc(' 7 % 4 + a', {
      params: {
        a: 2
      }
    })).toBe(5);
    expect(formulaCalc('6 % 300%')).toBe(0);
  });

  test('pow', () => {
    expect(formulaCalc('2 ^ 3')).toBe(8);
    expect(formulaCalc(' 2 ^ 3 ^ 2')).toBe(64);
    expect(formulaCalc(' 2 * 3 ^ 2 + 2')).toBe(20);
    expect(formulaCalc(' (2 * 3) ^ 2 + 2')).toBe(38);
    expect(formulaCalc(' (2 * 3) ^ (2 + 2)')).toBe(1296);
  });

  test('percent', () => {
    expect(formulaCalc('100%')).toBe(1);
    expect(formulaCalc('100% + 100%')).toBe(2);
    expect(formulaCalc('1% + 2% + 30% + 0.1%')).toBe(0.331);
    expect(formulaCalc('200% + 350%')).toBe(5.5);
    expect(formulaCalc('200% * 4 + 100%')).toBe(9);
    expect(formulaCalc('200% * (4 + 100%)')).toBe(10);
    expect(formulaCalc('600% % 300%')).toBe(0);
    expect(formulaCalc(' 7 % 4 + a%', {
      params: {
        a: 200
      }
    })).toBe(5);
    expect(formulaCalc(' 7 % a%', {
      params: {
        a: 200
      }
    })).toBe(1);
    expect(formulaCalc(' 7 % a%', {
      params: {
        a: Promise.resolve(200)
      }
    })).resolves.toBe(1);
  });

  test('and', () => {
    expect(formulaCalc('1 & 2')).toBe(2);
    expect(formulaCalc('1 + 2 & 1 + 3')).toBe(4);
    expect(formulaCalc('1 - 1 & 1 + 3')).toBe(0);
    expect(formulaCalc('true & 1 + 3')).toBe(4);
    expect(formulaCalc('false & 1 + 3')).toBe(false);
    expect(formulaCalc('null & 1 + 3')).toBe(null);

    expect(formulaCalc('1 && 2')).toBe(2);
    expect(formulaCalc('1 + 2 && 1 + 3')).toBe(4);
    expect(formulaCalc('1 - 1 && 1 + 3')).toBe(0);
    expect(formulaCalc('true && 1 + 3')).toBe(4);
    expect(formulaCalc('false && 1 + 3')).toBe(false);
    expect(formulaCalc('null && 1 + 3')).toBe(null);
  });

  test('or', () => {
    expect(formulaCalc('1 | 2')).toBe(1);
    expect(formulaCalc('1 + 2 | 1 + 3')).toBe(3);
    expect(formulaCalc('1 - 1 | 1 + 3')).toBe(4);
    expect(formulaCalc('true | 1 + 3')).toBe(true);
    expect(formulaCalc('false | 1 + 3')).toBe(4);
    expect(formulaCalc('null | 1 + 3')).toBe(4);

    expect(formulaCalc('1 || 2')).toBe(1);
    expect(formulaCalc('1 + 2 || 1 + 3')).toBe(3);
    expect(formulaCalc('1 - 1 || 1 + 3')).toBe(4);
    expect(formulaCalc('true || 1 + 3')).toBe(true);
    expect(formulaCalc('false || 1 + 3')).toBe(4);
    expect(formulaCalc('null || 1 + 3')).toBe(4);
  });

  test('not', () => {
    expect(formulaCalc('!2')).toBe(false);
    expect(formulaCalc('!0')).toBe(true);
    expect(formulaCalc('!""')).toBe(true);
    expect(formulaCalc('!(1 + 1)')).toBe(false);
    expect(formulaCalc('!(1 - 1)')).toBe(true);
    expect(formulaCalc('true & !1')).toBe(false);
    expect(formulaCalc('true & !(1 - 1)')).toBe(true);
    expect(formulaCalc('true & !!(1 - 1)')).toBe(false);
    expect(formulaCalc('true & !(!(1 - 1))')).toBe(false);


    expect(formulaCalc('true & !1%')).toBe(false);

    expect(formulaCalc('!noref(false)')).toBe(true);
  });

  test('gt', () => {
    expect(formulaCalc('1 > 2')).toBe(false);
    expect(formulaCalc('2 > 1')).toBe(true);
    expect(formulaCalc('true > 2')).toBe(false);
    expect(formulaCalc('false > 2')).toBe(false);
    expect(formulaCalc('2 >= 1')).toBe(true);
    expect(formulaCalc('1 >= 2')).toBe(false);
    expect(formulaCalc('2 + 5 >= 6 + 1')).toBe(true);
    expect(formulaCalc('3 + 4 >= 5 + 1')).toBe(true);
    expect(formulaCalc('2 + 5 >= 6 + 2')).toBe(false);

    expect(formulaCalc('a >= b', { params: { a: 10,  b: 2 } })).toBe(true);
    expect(formulaCalc('a >= b', { params: { a: '10',  b: '2' } })).toBe(false);
    expect(formulaCalc('a >= b', { params: { a: '10',  b: 2 } })).toBe(true);
    expect(formulaCalc('a >= b', { params: { a: 10,  b: '2' } })).toBe(true);
    expect(formulaCalc('a >= b', { params: { a: '10',  b: 2 } })).toBe(true);

    expect(formulaCalc('a > b', { params: { a: 10,  b: 2 } })).toBe(true);
    expect(formulaCalc('a > b', { params: { a: '10',  b: '2' } })).toBe(false);
    expect(formulaCalc('a > b', { params: { a: '10',  b: 2 } })).toBe(true);
    expect(formulaCalc('a > b', { params: { a: 10,  b: '2' } })).toBe(true);

    expect(formulaCalc('a - b% * c > 0', {
      params: {
        a: 7,
        b: 10,
        c: 80
      }
    })).toBe(false);
  });

  test('lt', () => {
    expect(formulaCalc('1 < 2')).toBe(true);
    expect(formulaCalc('2 < 1')).toBe(false);
    expect(formulaCalc('true < 2')).toBe(false);
    expect(formulaCalc('false < 2')).toBe(false);
    expect(formulaCalc('2 <= 1')).toBe(false);
    expect(formulaCalc('1 <= 2')).toBe(true);
    expect(formulaCalc('2 + 5 <= 6 + 1')).toBe(true);
    expect(formulaCalc('3 + 4 <= 5 + 1')).toBe(false);
    expect(formulaCalc('2 + 5 <= 6 + 2')).toBe(true);

    expect(formulaCalc('a <= b', { params: { a: 10,  b: 2 } })).toBe(false);
    expect(formulaCalc('a <= b', { params: { a: '10',  b: '2' } })).toBe(true);
    expect(formulaCalc('number(a) <= number(b)', { params: { a: '10',  b: '2' } })).toBe(false);
    expect(formulaCalc('a <= b', { params: { a: '10',  b: 2 } })).toBe(false);
    expect(formulaCalc('a <= b', { params: { a: 10,  b: '2' } })).toBe(false);

    expect(formulaCalc('a < b', { params: { a: 10,  b: 2 } })).toBe(false);
    expect(formulaCalc('a < b', { params: { a: '10',  b: '2' } })).toBe(true);
    expect(formulaCalc('a < b', { params: { a: '10',  b: 2 } })).toBe(false);
    expect(formulaCalc('a < b', { params: { a: 10,  b: '2' } })).toBe(false);

    expect(formulaCalc('a - b% * c < 0', {
      params: {
        a: 7,
        b: 10,
        c: 80
      }
    })).toBe(true);
  });

  test('eq', () => {
    expect(formulaCalc('1 == 2')).toBe(false);
    expect(formulaCalc('2 == 2')).toBe(true);
    expect(formulaCalc('1 = 2')).toBe(false);
    expect(formulaCalc('2 = 2')).toBe(true);
    expect(formulaCalc('true = 0')).toBe(false);
    expect(formulaCalc('false = 0')).toBe(false);
    expect(formulaCalc('0 = -0')).toBe(true);
    expect(formulaCalc('2 + 5 = 6 + 1')).toBe(true);
    expect(formulaCalc('3 + 4 = 5 + 1')).toBe(false);
    expect(formulaCalc('2 + 5 = 6 + 2')).toBe(false);
    expect(formulaCalc('1 + 1 = abs(-2)')).toBe(true);
    expect(formulaCalc('NaN = NaN')).toBe(true);
    expect(formulaCalc('1 / 0 = Infinity')).toBe(true);
    expect(formulaCalc('null = a', { params: { a: undefined } })).toBe(true);

    expect(formulaCalc('1 = a', { params: { a: 1 } })).toBe(true);
    expect(formulaCalc('1 = a', { params: { a: '1' } })).toBe(true);
    expect(formulaCalc('0 = a', { params: { a: '' }, nullAsZero: true })).toBe(true);
    expect(formulaCalc('0 = a', { params: { a: null }, nullAsZero: true })).toBe(true);
    expect(formulaCalc('0 = a', { params: { }, nullAsZero: true })).toBe(true);
    expect(formulaCalc('a = 0', { params: { }, nullAsZero: true })).toBe(true);
    expect(formulaCalc('a = null', { params: { }, nullAsZero: true })).toBe(true);
    expect(formulaCalc('0 = a.b', { params: { a: { } } })).toBe(false);
    expect(formulaCalc('a.b = 0', { params: { a: { } } })).toBe(false);
  });

  test('ne', () => {
    expect(formulaCalc('2 != 2')).toBe(false);
    expect(formulaCalc('1 != 2')).toBe(true);

    expect(formulaCalc('1 <> 2')).toBe(true);
    expect(formulaCalc('1 <> 1')).toBe(false);
    expect(formulaCalc('1 + 3 <> 2 + 2')).toBe(false);
    expect(formulaCalc('1 + 3 <> 2 + 1')).toBe(true);
  });

  test('if', () => {
    expect(formulaCalc('true ? 1 : 2')).toBe(1);
    expect(formulaCalc('false ? 1 : 2')).toBe(2);
    expect(formulaCalc('true ? 1 : false ? 2 : 3')).toBe(2);
    expect(formulaCalc('false ? 1 : false ? 2 : 3')).toBe(3);
    expect(formulaCalc('true ? 1 : (false ? 2 : 3)')).toBe(1);
    expect(formulaCalc('true ? 1 : (false ? 2 : 3)')).toBe(1);
    expect(formulaCalc('false ? 1 : (false ? 2 : 3)')).toBe(3);
    expect(formulaCalc('false ? 1 : (true ? 2 : 3)')).toBe(2);
    expect(formulaCalc(
      `a
        ? 2
        : 3
      `,
      { params: { a: true } }
    )).toBe(2);
    expect(formulaCalc(
      `a
        ? 2
        : 3
      `,
      { params: { a: false } }
    )).toBe(3);
    expect(formulaCalc(
      `a
        ? 2
        : 3
      `,
      { params: { a: true } }
    )).toBe(2);
    expect(formulaCalc(
      `a
        ? 1 + 1
        : 2 + 2
      `,
      { params: { a: true } }
    )).toBe(2);
    expect(formulaCalc(
      `a
        ? 1 + 1
        : 2 + 2
      `,
      { params: { a: false } }
    )).toBe(4);
    expect(formulaCalc(
      `a
       ? abs(-1)
       : abs(-3)
      `,
      { params: { a: true } }
    )).toBe(1);
    expect(formulaCalc(
      `a
        ? abs(-1)
        : abs(-3)
      `,
      { params: { a: false } }
    )).toBe(3);


    expect(formulaCalc(`
      (a + 2) > 0
      ? $1,
      : 0 - $1
      `, {
      params: {
        a: -3
      }
    })).toBe(1);
    expect(formulaCalc(`
        a > 0
        ? eval(planA)
        : eval(planB)
      `, {
      params: {
        a: -3,
        planA: 'a + 1',
        planB: '0 - a + 1',
      }
    })).toBe(4);

    expect(formulaCalc('"a" ? 1 : 2')).toBe(1);
    expect(formulaCalc('false ? 1 : 2')).toBe(2);
    expect(formulaCalc('0 ? 1 : 2')).toBe(2);
    expect(formulaCalc('"" ? 1 : 2')).toBe(2);

    expect(formulaCalc('(a + b) ? 1 : 2', {
      params: {
        a: '-1',
        b: '1'
      }
    })).toBe(2);

    expect(formulaCalc('a.b?.c ? 1 : 2', {
      params: {
        a: {
        }
      }
    })).toBe(2);

    expect(() => formulaCalc('?')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 ?')).toThrow('The formula is incorrect: not complete operator "?": expected 3 parameters, but got 1!');
    expect(() => formulaCalc('1 ? 2 :')).toThrow('The formula is incorrect: not complete operator "?": expected 3 parameters, but got 2!');
    expect(() => formulaCalc('1 ? :')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 :')).toThrow('The formula is incorrect!');
  });

  test('parenthesis', () => {
    expect(formulaCalc('(1 + 2) * 3')).toBe(9);
    expect(formulaCalc('(1 + 2) * (3 + 4)')).toBe(21);
    expect(() => formulaCalc('1 + 2) + 1')).toThrow('The formula is incorrect: No matching "(" was found for ")"');
    expect(formulaCalc('(1)')).toBe(1);
    expect(formulaCalc('(1,2,3)')).toStrictEqual([1, 2, 3]);
    expect(formulaCalc('a - (b / 100) * c', {
      params: {
        a: 7,
        b: 10,
        c: 80
      }
    })).toBe(-1);
    expect(formulaCalc('a - b% * c', {
      params: {
        a: 7,
        b: 10,
        c: 80
      }
    })).toBe(-1);
    expect(formulaCalc('a - max(b / 100, 0.2) * c', {
      params: {
        a: 7,
        b: 10,
        c: 80
      }
    })).toBe(-9);
  });

  test('precision', () => {
    // Floating point addition and subtraction precision issues
    expect(formulaCalc('0.1 + 0.2')).toBe(0.3);
    expect(formulaCalc('0.3 - 0.2')).toBe(0.1);
    expect(formulaCalc('0.7 - 0.1')).toBe(0.6);
    expect(formulaCalc('0.18 - 1')).toBe(-0.82);

    // Floating point multiplication precision issues
    expect(formulaCalc('19.9 * 100')).toBe(1990);
    expect(formulaCalc('0.7 * 180')).toBe(126);
    expect(formulaCalc('35.41 * 100')).toBe(3541);
    expect(formulaCalc('0.68 * 10')).toBe(6.8);

    // Floating point division precision issues
    expect(formulaCalc('10 / 3')).toBe(3.3333333333333335);
    expect(formulaCalc('2.2 / 100')).toBe(0.022);

    // Large number precision issues
    expect(formulaCalc('9007199254740992 + 1')).toBe(9007199254740992);
    expect(formulaCalc('9007199254740992 + 1.23 - 2.23')).toBe(9007199254740991);
    expect(formulaCalc('9007199254740992 + 1 - 1')).toBe(9007199254740992);
    expect(formulaCalc('9007199254740992 + 2')).toBe(9007199254740994);
    // expect(formulaCalc('9007199254740992 + 1.23')).toBe(9007199254740992);

    expect(formulaCalc('9007199254740992 * 2')).toBe(18014398509481984);
    expect(formulaCalc('9007199254740992 * 0.5')).toBe(4503599627370496);
    expect(formulaCalc('9007199254740992 * 3')).toBe(27021597764222976);
    expect(formulaCalc('9007199254740992 * 0.333333')).toBe(3002396749180579);

    expect(formulaCalc('9007199254740992 / 0.5')).toBe(18014398509481984);
    expect(formulaCalc('9007199254740992 / 2')).toBe(4503599627370496);
    expect(formulaCalc('9007199254740992 / 3')).toBe(3002399751580330.5);
    expect(formulaCalc('9007199254740992 / 9007199254740992')).toBe(1);

    // Scientific notation precision issues
    expect(formulaCalc('1e-4 + 1e-5')).toBe(0.00011);
    expect(formulaCalc('0.0001 + 0.00001')).toBe(0.00011);

    // Calculations with precision parameter
    expect(formulaCalc('10 / 3', { precision: 2 })).toBe(3.33);
    expect(formulaCalc('1e-4 + 1e-5', { precision: 6 })).toBe(0.00011);
  });

  test('other', () => {
    expect(() => formulaCalc('1 # 2')).toThrow('Invalid Token char: "#"');
  });
});

