import Decimal from 'decimal.js';
import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions } from '../type';
import { FormulaExecuteState, TokenType } from '../type';
import { isNumber, isPromise, toRound } from '../utils';

abstract class FormulaValue implements IFormulaValue {

  public origText: string;

  public value: any;

  public state: FormulaExecuteState;

  public options: FormulaValueOptions;

  public tokenType: TokenType;

  protected abstract _execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions): any;

  public execute(dataSource: IFormulaDataSource, options: FormulaValueOptions): any {
    this.state = FormulaExecuteState.fesExecuting;
    let prom = false;
    try {
      let value = this._execute(dataSource, options);
      prom = isPromise(value);
      const _next = (value: any) => {
        let stepPrecision = options.precision;
        let stepRrounding = isNumber(options.stepRrounding) || options.stepRrounding;
        if (stepRrounding && isNumber(options.stepRrounding)) {
          stepPrecision =  options.stepRrounding;
        }
        if ((options.Decimal || Decimal).isDecimal(value)) {
          value = stepRrounding
            ? toRound(value, stepPrecision, options.rounding)
            : value.toNumber();
        } else if (options.stepRrounding && isNumber(value)) {
          value = toRound(value, stepPrecision, options.rounding);
        }
        this.value = value;
        this.state = FormulaExecuteState.fesExecuted;
        return value;
      };
      if (prom) return value.then(_next).catch((e: any) => {
        this.state = FormulaExecuteState.fesExecuted;
        throw e;
      });
      return _next(value);
    } catch (e) {
      if (!prom) {
        this.state = FormulaExecuteState.fesExecuted;
      }
      throw e;
    }
  }

  constructor(origText: string, options: FormulaValueOptions = {}) {
    this.origText = origText;
    this.options = options || {};
    this.value = undefined;
    this.state = FormulaExecuteState.fesNone;
    // @ts-ignore
    this.tokenType = this.tokenType || TokenType.ttNone;
  }

}

export default FormulaValue;
