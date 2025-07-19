import { TokenType, Token } from '../type';
import type { IFormulaValue, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaString extends FormulaValue implements IFormulaValue {

  public tokenType: TokenType = TokenType.ttString;

  constructor(token: Token, options?: FormulaValueOptions) {
    super(token, options);
    this.value = token.token;
  }

  _execute(dataSource: IFormulaDataSource, options:  FormulaValueOptions) {
    return this.value;
  }

}

export default FormulaString;
