import type {  IFormulaDataSource, FormulaValueOptions, FormulaValues } from '../type';
import AbsFormulaFunction from '../base/function';
import { isDecimalTrue, nextWithPromise } from '../utils';

function ifExecute(
  params: FormulaValues,
  dataSource: IFormulaDataSource,
  options: FormulaValueOptions,
  forArithmetic?: boolean
) {
  return nextWithPromise(
    params[0].execute(dataSource, options),
    (a) => (
      isDecimalTrue(a, options)
        ? nextWithPromise(params[1].execute(dataSource, options, forArithmetic))
        : params[2] && nextWithPromise(params[2].execute(dataSource, options, forArithmetic))
    )
  );
}

class FormulaFunctionIF extends AbsFormulaFunction {

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) {
    return ifExecute(this.params, dataSource, options, forArithmetic);
  }

}

export {
  ifExecute
};

export default FormulaFunctionIF;
