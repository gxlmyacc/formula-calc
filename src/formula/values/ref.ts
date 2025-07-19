import { FormulaValues, TokenType, FormulaExecuteState, Token } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaRef extends FormulaValue {

  public tokenType: TokenType = TokenType.ttRef;

  public refs: FormulaValues;

  public order: number;

  constructor(token: Token, refs: FormulaValues, options?: FormulaValueOptions) {
    super(token, options);
    this.refs = refs;
    this.order = Number(token.token.substr(1, token.token.length));
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic: boolean) {
    const value = this.refs[this.order - 1];
    if (!value) {
      throw new Error(`can not find ${this.origText}\`s ref value!`);
    }
    if (value.state === FormulaExecuteState.fesExecuting) {
      throw new Error(`${this.origText} execute failed: exist circular reference!`);
    }
    const result = value.state === FormulaExecuteState.fesExecuted
      ? value.value
      : value.execute(dataSource, options, forArithmetic);
    return result;
  }

}

export default FormulaRef;
