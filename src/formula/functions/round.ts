
import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { toRound, nextWithPrimise } from '../utils';


class FormulaFunctionROUND extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPrimise(
      this.params.map(v => v.execute(dataSource, options)),
      params => {
        const value = params[0];
        const decimalPlaces = params.length > 1
          ? params[1]
          : 2;
        const rounding = options.rounding || (options.Decimal || Decimal).ROUND_HALF_UP;
        return toRound(value, decimalPlaces, rounding);
      },
      false
    );
    return result;
  }

}

export default FormulaFunctionROUND;
