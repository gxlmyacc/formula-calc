import Decimal from 'decimal.js';
import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions, Token } from '../type';
import { FormulaExecuteState, TokenType } from '../type';
import { isDecimal, isFunction, isNumber, isPromise, isStringNumber, toDecimal, toRound } from '../utils';
import { DEFAULT_DECIMAL_PLACES } from '../constant';
import FormulaParam from '../values/param';

function resolveValue(value: any, options: FormulaValueOptions, item: IFormulaValue, forArithmetic?: boolean) {
  if (!item || item.arithmetic || forArithmetic || options.tryStringToNumber) {
    let precision = options.precision ?? DEFAULT_DECIMAL_PLACES;
    const _stepPrecision = isFunction(options.stepPrecision)
      ? options.stepPrecision(item, value)
      : options.stepPrecision;
    const stepPrecision = isNumber(_stepPrecision) || _stepPrecision;
    if (stepPrecision && isNumber(_stepPrecision)) {
      precision =  _stepPrecision;
    }
    if (isNumber(value) || (options.tryStringToNumber && isStringNumber(value))) {
      value = toDecimal(value, options);
    }
    if (isDecimal(value, options)) {
      const { ignoreRoundingOriginalValue, ignoreRoundingParams, stepPrecisionIgnorePercent } = options;
      const shouldStepPrecision = (stepPrecision && value.decimalPlaces() > precision)
       && (!stepPrecisionIgnorePercent || item.tokenType !== TokenType.ttPercent)
       && (!ignoreRoundingOriginalValue || !item || item.mayChange)
       && (
         !(item as FormulaParam)?.isParam || (
           ignoreRoundingParams
             ? !(isFunction(ignoreRoundingParams) ? ignoreRoundingParams((item as FormulaParam).name) : true)
             : true
         )
       );
      if (shouldStepPrecision) {
        value = toRound(value, precision, options.rounding);
      } else if (options.nullAsZero && value.isNaN()) {
        value = new Decimal(0);
      }
    }
  }
  if (options.nullAsZero && (value == null || value === '' || (
    isNumber(value) && isNaN(value)
  ))) {
    value = new Decimal(0);
  }
  return value;
}

abstract class FormulaValue implements IFormulaValue {

  public token: Token;

  public get origText() {
    return this.token.quoteChar
      ? `${this.token.quoteChar}${this.token.token}${this.token.quoteChar}`
      : this.token.token;
  }

  public get line() {
    return this.token.line;
  }

  public get column() {
    return this.token.column;
  }

  public value: any;

  public name: string = '';

  public state: FormulaExecuteState;

  public options: FormulaValueOptions;

  public tokenType: TokenType;

  public arithmetic: boolean = false;

  public mayChange: boolean = false;

  protected abstract _execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions, forArithmetic?: boolean): any;

  public execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean): any {
    this.state = FormulaExecuteState.fesExecuting;
    let prom = false;
    try {
      const value = this._execute(dataSource, options);
      prom = isPromise(value);
      const _next = (value: any) => {
        this.value = resolveValue(value, options, this, forArithmetic);
        this.state = FormulaExecuteState.fesExecuted;
        if (options.onTrace) {
          options.onTrace(this, isDecimal(this.value, options) ? this.value.toNumber() : this.value);
        }
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

  constructor(token: Token, options: FormulaValueOptions = {}) {
    this.token = token;
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
