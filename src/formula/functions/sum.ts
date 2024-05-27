
import Decimal from 'decimal.js';
import { FormulaValues } from '../type';
import type { IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';

import { walkValues } from './utils';


function sumExecute(
  params: FormulaValues,
  dataSource: IFormulaDataSource,
  options: FormulaValueOptions,
  onWalk?: (itemValue: any, index: number, isArray: boolean) => void,
) {
  let value = new (options.Decimal || Decimal)(0);
  return walkValues(
    params,
    dataSource,
    options,
    (itemValue, index, isArray) => {
      onWalk && onWalk(itemValue, index, isArray);
      if (isArray) {
        (itemValue as any[]).forEach(v => {
          value = value.add(v);
        });
      } else {
        value = value.add(itemValue);
      }
      return value;
    }
  );
}

class FormulaFunctionSUM extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    return sumExecute(this.params, dataSource, options);
  }

}

export {
  sumExecute
};

export default FormulaFunctionSUM;
