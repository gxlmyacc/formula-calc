
import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { isDecimal, nextWithPromise } from '../utils';

class FormulaFunctionRANDOM extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPromise(
      this.params.map((v) => v.execute(dataSource, options, true)),
      (params) => {
        let significantDigits = params.length
          ? params[0]
          : 10;
        if (isDecimal(significantDigits, options)) {
          significantDigits = significantDigits.toNumber();
        }
        // eslint-disable-next-line prefer-spread
        return (options.Decimal || Decimal).random(significantDigits);
      },
      false
    );
    return result;
  }

}


export default FormulaFunctionRANDOM;
