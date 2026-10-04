import { describe, expect, test } from '@jest/globals';
import { createFormula, createParamsDataSource } from '../src';
import { FormulaExecuteState } from '../src/formula/type';

describe('direct formula node execution', () => {
  test('a reference reuses the result of a completed node', () => {
    const formula = createFormula('(a) + $1');
    let reads = 0;
    const dataSource = createParamsDataSource(() => {
      reads++;
      return 2;
    });
    const result = formula.formulas[0].execute(dataSource, {});
    expect(Number(result)).toBe(4);
    expect(reads).toBe(1);
  });

  test('a forward reference executes its target before it has a result', () => {
    const formula = createFormula('$1 + (a)');
    const result = formula.formulas[0].execute(createParamsDataSource({ a: 3 }), {});
    expect(Number(result)).toBe(6);
  });

  test('a reference to a currently executing ancestor is rejected', () => {
    const formula = createFormula('(1 + $1)');
    expect(() => formula.formulas[0].execute(createParamsDataSource({}), {}))
      .toThrow('$1 execute failed: exist circular reference!');
  });
});

describe('formula reparsing', () => {
  test('reparsing releases old references and resets their execution state', () => {
    const formula = createFormula('(a) + $1');
    expect(formula.execute(createParamsDataSource({ a: 2 }))).toBe(4);
    const oldReference = formula.refs[0];
    expect(oldReference.state).toBe(FormulaExecuteState.fesExecuted);

    formula.parse('(b) + $1');
    expect(oldReference.state).toBe(FormulaExecuteState.fesNone);
    expect(formula.refs).toHaveLength(1);
    expect(formula.refs[0]).not.toBe(oldReference);
    expect(formula.execute(createParamsDataSource({ b: 3 }))).toBe(6);

    formula.clear();
    expect(formula.refs).toHaveLength(0);
    expect(formula.formulas).toHaveLength(0);
    expect(() => formula.execute()).toThrow();
  });
});
