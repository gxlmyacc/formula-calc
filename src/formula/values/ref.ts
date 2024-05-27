import { FormulaValues, TokenType, FormulaExecuteState } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaRef extends FormulaValue {

  public tokenType: TokenType = TokenType.ttRef;

  public refs: FormulaValues;

  public order: number;

  constructor(origText: string, refs: FormulaValues, options?: FormulaValueOptions) {
    super(origText, options);
    this.refs = refs;
    this.order = Number(origText.substr(1, origText.length));
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const value = this.refs[this.order - 1];
    if (!value) {
      throw new Error(`can not find ${this.origText}\`s ref value!`);
    }
    if (value.state === FormulaExecuteState.fesExecuting) {
      throw new Error(`${this.origText} execute failed: exist circular reference!`);
    }
    return value.state === FormulaExecuteState.fesExecuted
      ? value.value
      : value.execute(dataSource, options);
  }

}

export default FormulaRef;
