import { Token } from '../type';
import type { IFormulaParam, IFormulaDataSource,  FormulaValueOptions } from '../type';
import FormulaValue from '../base/value';
import { isDecimalValue } from '../utils';

class FormulaParam extends FormulaValue implements IFormulaParam {

  public name: string;

  public isParam: boolean = true;

  constructor(token: Token, options?: FormulaValueOptions) {
    super(token, options);
    this.name = token.token;
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic: boolean) {
    const value = dataSource.getParam(this.name, options, forArithmetic);
    this.arithmetic = isDecimalValue(value, options);
    return value;
  }

}

class FormulaParamValue extends FormulaParam {

  constructor(token: Token, value: any, options: FormulaValueOptions) {
    super(token, options);
    this.updateValue(value, options);
  }

  updateValue(value: any, options: FormulaValueOptions = {}) {
    this.value = value;
    this.arithmetic = isDecimalValue(value, options);
  }

  _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic: boolean) {
    return this.value;
  }

}

export {
  FormulaParamValue
};

export default FormulaParam;
