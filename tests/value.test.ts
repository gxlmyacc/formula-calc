import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('value test', () => {
  test('number', () => {
    expect(formulaCalc('1')).toBe(1);
    expect(formulaCalc(' 1.1')).toBe(1.1);
    expect(formulaCalc(' -1.1')).toBe(-1.1);
    expect(formulaCalc(' 9e4')).toBe(90000);
    expect(formulaCalc(' 9e-4')).toBe(0.0009);
    expect(formulaCalc(' 9e-7')).toBe(0.0000009);
    expect(formulaCalc(' NaN')).toBe(NaN);
    expect(formulaCalc(' Infinity')).toBe(Infinity);

    expect(() => formulaCalc('1.111.11')).toThrow('Illegal number: already exist decimal separator "."');
    expect(() => formulaCalc('1.1e2')).toThrow('Illegal number: invalid char "e"');
    expect(() => formulaCalc('1e2e3')).toThrow('Illegal number: invalid char "e"');
    expect(() => formulaCalc('11111a1.00')).toThrow('Illegal number: unknown char "a"');
  });
  test('string', () => {
    expect(formulaCalc('"string"')).toBe('string');
    expect(formulaCalc(`"string
dd
aa"`)).toBe('string\ndd\naa');
    expect(formulaCalc('"string \\" dd \\" aa"')).toBe('string " dd " aa');
    expect(() => formulaCalc('"string')).toThrow('missing end quote char ": "string');
  });
  test('null', () => {
    expect(formulaCalc('null')).toBe(null);
    expect(formulaCalc('NULL', { nullAsZero: true })).toBe(0);
    // expect(formulaCalc('NULL')).toBe(null);
    expect(() => formulaCalc('NULL')).toThrow('require param: "NULL" !');
  });
  test('bool', () => {
    expect(formulaCalc('true')).toBe(true);
    expect(formulaCalc('false')).toBe(false);
    // expect(formulaCalc('TRUE')).toBe(true);
    // expect(formulaCalc('FALSE')).toBe(false);
    expect(() => formulaCalc('TRUE')).toThrow('require param: "TRUE" !');
    expect(() => formulaCalc('FALSE')).toThrow('require param: "FALSE" !');
  });
  test('name/param', () => {
    expect(formulaCalc('a', {
      params: {
        a: 1
      }
    })).toBe(1);
    expect(formulaCalc("'a b'", {
      params: {
        'a b': 1
      }
    })).toBe(1);
    expect(formulaCalc("'a \\' b \\' c'", {
      params: {
        'a \' b \' c': 1
      }
    })).toBe(1);

    expect(formulaCalc('a.b', {
      params: {
        a: {
          b: 2
        }
      }
    })).toBe(2);
    expect(formulaCalc('a.1', {
      params: {
        a: [1, 2, 3]
      }
    })).toBe(2);

    expect(() => formulaCalc('t')).toThrow('require param: "t" !');
    expect(() => formulaCalc('a')).toThrow('require param: "a" !');
    expect(() => formulaCalc('a.b')).toThrow('require param: "a.b" !');

    expect(() => formulaCalc('a', { params: {} })).toThrow('require param: "a" !');
    expect(() => formulaCalc('a.b', { params: {} })).toThrow('require param: "a" !');
    expect(() => formulaCalc('a.b', {
      params: {
        a: {
          c: 2
        }
      }
    })).toThrow('param "a.b" is not exist!');

    expect(() => formulaCalc('a.3', {
      params: {
        a: [1, 2, 3]
      }
    })).toThrow('param "a.3" is not exist!');

    expect(formulaCalc('a.b', {
      params: {
        a: {
          b: Promise.resolve(2)
        }
      }
    })).resolves.toBe(2);
    expect(formulaCalc('a.b', {
      params: {
        a: {
          b: Promise.reject('promise error')
        }
      }
    })).rejects.toBe('promise error');

    // @ts-ignore
    // expect(() => formulaCalc('a', { dataSource: null })).toThrow('param must have a dataSource!');
  });

  test('ref', () => {
    expect(formulaCalc('(1)+$1')).toBe(2);
    expect(formulaCalc('1 + (3 - (1 + 1)) + $1')).toBe(3);
    expect(formulaCalc('1 + noref(3 - (1 + 1)) + $1')).toBe(4);
    expect(formulaCalc('1 + (3 - (1 + 1)) + $1 + $2')).toBe(5);
    expect(formulaCalc('1 + $1 + (3 - (1 + 1)) + $2')).toBe(5);
    expect(formulaCalc('1 + (3 + abs(a) - (1 + 1)) + $1 + $2', {
      params: {
        a: -1
      }
    })).toBe(7);

    expect(() => formulaCalc('1 + (1 + 1 + $1)'))
      .toThrow('$1 execute failed: exist circular reference!');

    expect(() => formulaCalc('1 + noref(1 + 1) + $1'))
      .toThrow('can not find $1`s ref value!');
    expect(() => formulaCalc('(1 + 1) + $a')).toThrow('Illegal ref char: invalid char "a"');

    expect(() => formulaCalc('1 + true')).toThrow('[DecimalError] Invalid argument: true');
    expect(() => formulaCalc('1 + a', {
      params: {
        a: Promise.resolve(true)
      }
    })).rejects.toThrow('[DecimalError] Invalid argument: true');
  });
});

