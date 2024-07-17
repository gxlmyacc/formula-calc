import Decimal from 'decimal.js';
import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions } from '../type';
import { FormulaExecuteState, TokenType } from '../type';
import { isNumber, isPromise, toRound } from '../utils';

function resolveValue(value: any, options: FormulaValueOptions, item?: IFormulaValue) {
  if (!item || item.arithmetic) {
    let precision = options.precision;
    let stepPrecision = isNumber(options.stepPrecision) || options.stepPrecision;
    if (stepPrecision && isNumber(options.stepPrecision)) {
      precision =  options.stepPrecision;
    }
    if ((options.Decimal || Decimal).isDecimal(value)) {
      value = stepPrecision
        ? toRound(value, precision, options.rounding)
        : value.toNumber();
    } else if (options.stepPrecision && isNumber(value)) {
      value = toRound(value, precision, options.rounding);
    }
  } else if ((options.Decimal || Decimal).isDecimal(value)) {
    value = value.toNumber();
  }
  if (options.nullAsZero && (value == null || isNaN(value))) {
    value = 0;
  }
  return value;
}

abstract class FormulaValue implements IFormulaValue {

  public origText: string;

  public value: any;

  public state: FormulaExecuteState;

  public options: FormulaValueOptions;

  public tokenType: TokenType;

  public arithmetic: boolean = false;

  protected abstract _execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions): any;

  public execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any {
    this.state = FormulaExecuteState.fesExecuting;
    let prom = false;
    try {
      let value = this._execute(dataSource, options);
      prom = isPromise(value);
      const _next = (value: any) => {
        this.value = resolveValue(value, options, this);
        this.state = FormulaExecuteState.fesExecuted;
        return this.value;
      };
      if (prom) return value.then(_next).catch((e: any) => {
        this.state = FormulaExecuteState.fesExecuted;
        return Promise.reject(e);
      });
      return _next(value);
    } catch (e) {
      this.state = FormulaExecuteState.fesExecuted;
      throw e;
    }
  }

  constructor(origText: string, options: FormulaValueOptions = {}) {
    this.origText = origText;
    this.options = options;
    this.value = undefined;
    this.state = FormulaExecuteState.fesNone;
    // @ts-ignore
    this.tokenType = this.tokenType || TokenType.ttNone;
  }

}

export {
  resolveValue
};

export default FormulaValue;
