import Decimal from 'decimal.js';
import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { walkValues } from './utils';

class FormulaFunctionMAX extends AbsFormulaFunction {

  public arithmetic = true;

  public mayChange = true;

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    let result: any;
    return walkValues<Decimal>(
      this,
      this.params,
      dataSource,
      options,
      (itemValue, index, isArray, isFirst) => {
        const values = isArray ? itemValue as Decimal[] : [itemValue as Decimal];
        values.forEach((value, index) => {
          if (isFirst && !index) {
            result = value;
            return;
          }
          if (value.greaterThan(result)) {
            result = value;
          }
        });
        return result;
      },
      true,
    );
  }

}


export default FormulaFunctionMAX;
