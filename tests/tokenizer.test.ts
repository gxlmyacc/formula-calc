import { describe, expect, test } from '@jest/globals';
import formulaCalc from '../src';

describe('tokenizer test', () => {
  test('incorrect', () => {
    expect(() => formulaCalc('+ 1')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 + * 1')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 + - 1')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 + )')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('(1 + 1')).toThrow('The formula is incorrect: there are unclosed parentheses!');
    expect(() => formulaCalc('1 + 1 dd')).toThrow('The formula is incorrect: contains multiple formula expressions');
    expect(() => formulaCalc('+ abs(-1)')).toThrow('The formula is incorrect!');

    expect(() => formulaCalc('')).toThrow('The formula is empty!');
    expect(() => formulaCalc('1 + 1, 1 + 2')).toThrow('The formula is incorrect: contains multiple formula expressions');
  });
});

