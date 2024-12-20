
import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { toRound, nextWithPrimise, isDecimal } from '../utils';


class FormulaFunctionROUND extends AbsFormulaFunction {

  public arithmetic = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      this.params.map(v => v.execute(dataSource, options, true)),
      params => {
        const value = params[0];
        let decimalPlaces = params.length > 1
          ? params[1]
          : 2;
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
