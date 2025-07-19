import { TokenType, Token } from '../type';
import type { IFormulaValue, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaNaN extends FormulaValue implements IFormulaValue {

  public tokenType: TokenType = TokenType.ttBool;

  constructor(token: Token, options?: FormulaValueOptions) {
    super(token, options);
    this.value = NaN;
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return this.value;
  }

}

export default FormulaNaN;
