import { describe, expect, test } from '@jest/globals';
import formulaCalc, { createFormula, createToken, TokenType } from '../src';
import FormulaParam from '../src/formula/values/param';
import FormulaString from '../src/formula/values/string';
import type { IFormulaBase } from '../src/formula/type';

describe('exact original text', () => {
  test.each([
    ['1   +   2', 3],
    ['1\n\n +\t 2', 3],
    ['( 1\n\n +  2 )', 3],
    ['1 + sum(\n\n  2,  3\n)', 6],
    ['sum(1, max( 2,\n\n 3 ))', 4],
    ['true\n\n ?  1\t :  2', 1],
    ['false ? 1 : true\n ? 2 : 3', 2],
    ['! \t false', true],
    ['100 \t %', 1],
    [String.raw`"a\"b"`, 'a"b'],
    ['"张\r\n\r\n三"', '张\r\n\r\n三'],
  ])('restores %s without changing its result', (expression, result) => {
    const source = expression as string;
    const formula = createFormula(source);
    const traced: string[] = [];
    expect(formulaCalc(formula, { onTrace: (item) => { traced.push(item.origText); } })).toEqual(result);
    expect(formula.origText).toBe(source);
    expect(formula.formulas[0].origText).toBe(source);
    expect(traced[traced.length - 1]).toBe(source);
  });

  test.each(['\n', '\r\n', '\n\r', '\r'])('keeps blank lines and positions with newline %j', (newline) => {
    const expression = ` \t1${newline}${newline}  +\t 2 \t`;
    const formula = createFormula(expression);
    const traced: Array<[string, number, number]> = [];
    expect(formulaCalc(formula, {
      onTrace: (item) => { traced.push([item.origText, item.line, item.column]); },
    })).toBe(3);
    expect(formula.origText).toBe(expression);
    expect(traced).toEqual([
      ['1', 1, 3],
      ['2', 3, 6],
      [`1${newline}${newline}  +\t 2`, 1, 3],
    ]);
  });

  test('preserves the full text of nested functions used as operator operands', () => {
    const expression = '1  +  sum( 2, max(\n 3,  4\n) )';
    const formula = createFormula(expression);
    const traced: string[] = [];
    expect(formulaCalc(formula, { onTrace: (item) => { traced.push(item.origText); } })).toBe(7);
    expect(traced).toEqual(['1', '2', '3', '4', 'max(\n 3,  4\n)', 'sum( 2, max(\n 3,  4\n) )', expression]);
    const root = formula.formulas[0] as IFormulaBase;
    const func = root.params[1];
    expect(func.token.length).toBe(3);
    expect(formula.tokenizer.items.find((token) => token.token === 'sum')?.length).toBe(3);
  });

  test('keeps quoted parameter escapes and works with parameter creation hooks', () => {
    const expression = String.raw`'a \' b'`;
    const formula = createFormula(expression, {
      onCreateParam: (token, options) => new FormulaParam(token, options),
    });
    expect(formulaCalc(formula, { params: { "a ' b": 7 } })).toBe(7);
    expect(formula.formulas[0].origText).toBe(expression);
  });

  test('cached and reparsed formulas retain their own source text', () => {
    const expression = '1  +\n\n  2';
    for (let i = 0; i < 2; i++) {
      expect(formulaCalc(expression, {
        cache: true,
        onFormulaCreated: (formula) => { expect(formula.formulas[0].origText).toBe(expression); },
      })).toBe(3);
    }
    const formula = createFormula(expression);
    formula.parse('sum( 3,\n4 )');
    expect(formula.formulas[0].origText).toBe('sum( 3,\n4 )');
  });

  test('manually created nodes retain token text and explicit text overrides', () => {
    const param = new FormulaParam(createToken('a', TokenType.ttName));
    expect(param.origText).toBe('a');
    const token = createToken('a"b', TokenType.ttString, 0, 1, 1, 6, '"');
    const value = new FormulaString(token);
    expect(value.origText).toBe('"a"b"');
    value.origText = String.raw`"a\"b"`;
    expect(value.origText).toBe(String.raw`"a\"b"`);
    expect(token.origText).toBeUndefined();
  });
});
