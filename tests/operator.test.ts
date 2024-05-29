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
    // expect(formulaCalc(' -1.1 / 4 + %a%', {
    //   params: {
    //     a: 2
    //   }
    // })).toBe(1.725);
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
  });

  test('or', () => {
    expect(formulaCalc('1 | 2')).toBe(1);
    expect(formulaCalc('1 + 2 | 1 + 3')).toBe(3);
    expect(formulaCalc('1 - 1 | 1 + 3')).toBe(4);
    expect(formulaCalc('true | 1 + 3')).toBe(true);
    expect(formulaCalc('false | 1 + 3')).toBe(4);
    expect(formulaCalc('null | 1 + 3')).toBe(4);
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

    expect(formulaCalc('1 <> 2')).toBe(true);
    expect(formulaCalc('1 <> 1')).toBe(false);
    expect(formulaCalc('1 + 3 <> 2 + 2')).toBe(false);
    expect(formulaCalc('1 + 3 <> 2 + 1')).toBe(true);
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
  });

  test('lt', () => {
    expect(formulaCalc('1 < 2')).toBe(true);
    expect(formulaCalc('2 < 1')).toBe(false);
    expect(formulaCalc('true < 2')).toBe(true);
    expect(formulaCalc('false < 2')).toBe(true);
    expect(formulaCalc('2 <= 1')).toBe(false);
    expect(formulaCalc('1 <= 2')).toBe(true);
    expect(formulaCalc('2 + 5 <= 6 + 1')).toBe(true);
    expect(formulaCalc('3 + 4 <= 5 + 1')).toBe(false);
    expect(formulaCalc('2 + 5 <= 6 + 2')).toBe(true);
  });

  test('eq', () => {
    expect(formulaCalc('1 = 2')).toBe(false);
    expect(formulaCalc('2 = 2')).toBe(true);
    expect(formulaCalc('true = 0')).toBe(false);
    expect(formulaCalc('false = 0')).toBe(false);
    expect(formulaCalc('2 + 5 = 6 + 1')).toBe(true);
    expect(formulaCalc('3 + 4 = 5 + 1')).toBe(false);
    expect(formulaCalc('2 + 5 = 6 + 2')).toBe(false);
    expect(formulaCalc('1 + 1 = abs(-2)')).toBe(true);
    expect(formulaCalc('NaN = NaN')).toBe(true);
    expect(formulaCalc('1 / 0 = Infinity')).toBe(true);
  });

  test('ne', () => {
    expect(formulaCalc('2 != 2')).toBe(false);
    expect(formulaCalc('1 != 2')).toBe(true);
  });

  test('parenthesis', () => {
    expect(formulaCalc('(1 + 2) * 3')).toBe(9);
    expect(formulaCalc('(1 + 2) * (3 + 4)')).toBe(21);
    expect(() => formulaCalc('1 + 2) + 1')).toThrow('The formula is incorrect: No matching "(" was found for ")"');
    expect(formulaCalc('(1)')).toBe(1);
    expect(formulaCalc('(1,2,3)')).toStrictEqual([1, 2, 3]);
  });

  test('other', () => {
    expect(() => formulaCalc('1 # 2')).toThrow('Invalid Token char: "#"');
  });
});

