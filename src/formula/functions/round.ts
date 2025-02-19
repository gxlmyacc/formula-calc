
import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { toRound, nextWithPromise, isDecimal } from '../utils';
import { DEFAULT_DECIMAL_PLACES } from '../constant';


class FormulaFunctionROUND extends AbsFormulaFunction {

  public arithmetic = true;

  public mayChange = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPromise(
      this.params.map((v) => v.execute(dataSource, options, true)),
      (params) => {
        const value = params[0];
        let decimalPlaces = params.length > 1
          ? params[1]
          : (options.precision ?? DEFAULT_DECIMAL_PLACES);
        if (isDecimal(decimalPlaces, options)) {
          decimalPlaces = decimalPlaces.toNumber();
        }
        const rounding = options.rounding || (options.Decimal || Decimal).ROUND_HALF_UP;
        return toRound(value, decimalPlaces, rounding);
      },
      false
    );
    return result;
  }

}

export default FormulaFunctionROUND;
