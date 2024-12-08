import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';

class FormulaFunctionDecimal extends AbsFormulaFunction {

  public arithmetic = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const decimal = (options.Decimal || Decimal) as any;
    const result = nextWithPrimise(
      this.params.map(param => param.execute(dataSource, options, true)),
      // eslint-disable-next-line prefer-spread
      args => decimal[this.name].apply(decimal, args),
      false
    );
    return result;
  }

}

export default FormulaFunctionDecimal;
