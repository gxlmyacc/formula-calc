import type {  IFormulaDataSource, FormulaValueOptions } from '../type';
import AbsFormulaFunction from '../base/function';
import { isDecimal, nextWithPromise, toDecimal } from '../utils';

const CAST_MAP = {
  string: (value: any) => {
    if (value == null) {
      return '';
    }
    return String(value);
  },
  number: (value: any, options: FormulaValueOptions) => toDecimal(value, options),
  boolean: (value: any) => Boolean(value),
};

class FormulaFunctionCAST extends AbsFormulaFunction {

  public mayChange = true;

  constructor(origText: string,  options: FormulaValueOptions, name: string, argMin: number, argMax: number) {
    super(origText, options, name, argMin, argMax);
    this.arithmetic = name === 'number';
  }

  public _execute(dataSource: IFormulaDataSource, options: FormulaValueOptions) {
    const result = nextWithPromise(
      this.params.map((param) => param.execute(dataSource, options, this.arithmetic)),
      (value) => {
        if (isDecimal(value, options)) {
          value = value.toNumber();
        }
        return (CAST_MAP as any)[this.name](value, options);
      },
    );
    return result;
  }

}

export {
  CAST_MAP
};

export default FormulaFunctionCAST;
