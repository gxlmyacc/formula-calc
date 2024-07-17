import { TokenType,  } from '../type';
import type { IFormulaValue, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaNumber extends FormulaValue implements IFormulaValue {

  public arithmetic = true;

  constructor(origText: string, options?: FormulaValueOptions) {
    super(origText, options);
    this.value = Number(origText);
    this.tokenType = TokenType.ttNumber;
  }

  _execute(dataSource: IFormulaDataSource, options:  FormulaValueOptions) {
    return this.value;
  }

}

export default FormulaNumber;
