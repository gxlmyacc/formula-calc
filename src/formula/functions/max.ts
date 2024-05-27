import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { walkValues } from './utils';

class FormulaFunctionMAX extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    let result: any;
    return walkValues(
      this.params,
      dataSource,
      options,
      (itemValue, index, isArray) => {
        if (!isArray) itemValue = [itemValue];
        itemValue.forEach((value: any) => {
          if (!index) {
            result = value;
            return;
          }
          if (value > result) {
            result = value;
          }
        });
        return result;
      }
    );
  }

}


export default FormulaFunctionMAX;
