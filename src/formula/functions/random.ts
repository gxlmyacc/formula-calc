
import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { nextWithPrimise } from '../utils';

class FormulaFunctionRANDOM extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      [
        this.params[0]?.execute(dataSource, options)
      ],
      params => {
        const significantDigits = params.length
          ? params[0]
          : 10;
        // eslint-disable-next-line prefer-spread
        return (options.Decimal || Decimal).random(significantDigits);
      },
      false
    );
    return result;
  }

}


export default FormulaFunctionRANDOM;
