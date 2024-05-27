import { TokenType,  } from '../type';
import type { IFormulaValue, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';

class FormulaBool extends FormulaValue implements IFormulaValue {

  public tokenType: TokenType = TokenType.ttBool;

  constructor(origText: string, options?: FormulaValueOptions) {
    super(origText, options);
    this.value = origText.toLowerCase() === 'true';
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return this.value;
  }

}

export default FormulaBool;
