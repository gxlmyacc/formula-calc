import { TokenType,  } from '../type';
import type { IFormulaParam, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';
import { isDecimalValue } from '../utils';

class FormulaParam extends FormulaValue implements IFormulaParam {

  public name: string;

  public tokenType: TokenType;


  constructor(origText: string,  name: string, tokenType: TokenType, options?: FormulaValueOptions) {
    super(origText, options);
    this.name = name;
    this.tokenType = tokenType;
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic: boolean) {
    // if (!dataSource) {
    //   throw new Error('param must have a dataSource!');
    // }
    const value = dataSource.getParam(this.name, options, forArithmetic);
    this.arithmetic = isDecimalValue(value, options);
    return value;
  }

}

export default FormulaParam;
