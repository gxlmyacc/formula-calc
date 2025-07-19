import { TokenType, Token } from '../type';
import type { IFormulaValue, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaNumber extends FormulaValue implements IFormulaValue {

  public arithmetic = true;

  constructor(token: Token, options?: FormulaValueOptions) {
    super(token, options);
    this.value = Number(token.token);
    this.tokenType = TokenType.ttNumber;
  }

  _execute(dataSource: IFormulaDataSource, options:  FormulaValueOptions) {
    return this.value;
  }

}

export default FormulaNumber;
