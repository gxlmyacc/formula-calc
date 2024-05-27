import { TokenType,  } from '../type';
import type { IFormulaValue, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaString extends FormulaValue implements IFormulaValue {

  public tokenType: TokenType = TokenType.ttString;

  constructor(origText: string, value: string, options?: FormulaValueOptions) {
    super(origText, options);
    this.value = value;
  }

  _execute(dataSource: IFormulaDataSource, options:  FormulaValueOptions) {
    return this.value;
  }

}

export default FormulaString;
