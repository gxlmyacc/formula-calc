import { describe, expect, test } from '@jest/globals';
import formulaCalc, { TokenType } from '../src';
import Tokenizer from '../src/formula/tokenizer';

describe('tokenizer test', () => {
  test('incorrect', () => {
    expect(() => formulaCalc('+ 1')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 + * 1')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 + - 1')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('1 + )')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('(1 + 1')).toThrow('The formula is incorrect: there are unclosed parentheses!');
    expect(() => formulaCalc('1 + 1 dd')).toThrow('The formula is incorrect: contains multiple formula expressions');
    expect(() => formulaCalc('1 + 1 abs(1)')).toThrow('The formula is incorrect: contains multiple formula expressions');
    expect(() => formulaCalc('1 ++ abs(1)')).toThrow('The formula is incorrect!');
    expect(() => formulaCalc('+ abs(-1)')).toThrow('The formula is incorrect!');

    expect(() => formulaCalc('')).toThrow('The formula is empty!');
    expect(() => formulaCalc('1 + 1, 1 + 2')).toThrow('The formula is incorrect: contains multiple formula expressions');
  });

  test('onTokenError', () => {
    expect(() => {
      const tokenizer = new Tokenizer();
      tokenizer.onTokenError = (errorId, errorStr) => {
        throw new Error(`[${errorId}]${errorStr}`);
      };
      tokenizer.tokenize('.');
    }).toThrow('[3]Invalid Token char: "."');
  });

  test('changeLast', () => {
    const tokenizer = new Tokenizer();
    expect(tokenizer.changeLast(TokenType.ttNone, 0)).toBe(undefined);
  });
});

