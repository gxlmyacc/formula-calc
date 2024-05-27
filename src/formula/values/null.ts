import { TokenType,  } from '../type';
import type { IFormulaValue, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaNull extends FormulaValue implements IFormulaValue {

  public tokenType: TokenType = TokenType.ttNull;

  constructor(origText: string, options?: FormulaValueOptions) {
    super(origText, options);
    this.value = null;
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return this.value;
  }

}

export default FormulaNull;
