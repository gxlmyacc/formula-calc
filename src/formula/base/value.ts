import Decimal from 'decimal.js';
import type { IFormulaValue, IFormulaDataSource, FormulaValueOptions, FormulaValueTransformation, Token } from '../type';
import { FormulaExecuteState, TokenType } from '../type';
import { isDecimal, isFunction, isNumber, isPromise, isStringNumber, toDecimal, toRound } from '../utils';
import { DEFAULT_DECIMAL_PLACES } from '../constant';
import { enterExecution, saveExecutionResult } from '../execution';

function resolveValue(
  value: any,
  options: FormulaValueOptions,
  item: IFormulaValue,
  forArithmetic?: boolean,
  transformations?: FormulaValueTransformation[],
) {
  if (!item || item.arithmetic || forArithmetic || options.tryStringToNumber) {
    if (isNumber(value) || (options.tryStringToNumber && isStringNumber(value))) {
      value = toDecimal(value, options);
    }
    if (isDecimal(value, options)) {
      if (options.nullAsZero && value.isNaN()) {
        const before = value;
        value = new Decimal(0);
        transformations?.push({ type: 'nullAsZero', before, after: value });
      }
    }
  }
  // Parameters have their own policy; the original-value switch must not override its callback.
  const param = item as IFormulaValue & { isParam?: boolean };
  const ignoreParam = options.ignoreRoundingParams ?? true;
  const eligible = (isNumber(options.stepPrecision) || options.stepPrecision) && item && (param.isParam
    ? !(isFunction(ignoreParam) ? ignoreParam(item.name) : ignoreParam)
    : item.useStepPrecision || (item.tokenType === TokenType.ttNumber && options.ignoreRoundingOriginalValue === false));
  if (eligible && !(options.stepPrecisionIgnorePercent && item.tokenType === TokenType.ttPercent)) {
    const step = isFunction(options.stepPrecision) ? options.stepPrecision(item, value) : options.stepPrecision;
    if (isNumber(step) || step) {
      let precision = isNumber(step) ? step : options.precision ?? DEFAULT_DECIMAL_PLACES;
      // A percent is stored as a ratio: rounding its numerator needs two extra decimal places.
      if (item.tokenType === TokenType.ttPercent) {
        precision += 2;
      }
      if (isNumber(value) || (options.tryStringToNumber && isStringNumber(value))) {
        value = toDecimal(value, options);
      }
      if (isDecimal(value, options) && value.decimalPlaces() > precision) {
        const before = value;
        value = toRound(value, precision, options.rounding);
        transformations?.push({ type: 'stepPrecision', before, after: value, precision });
      }
    }
  }
  if (options.nullAsZero && (value == null || value === '' || (
    isNumber(value) && isNaN(value)
  ))) {
    const before = value;
    value = new Decimal(0);
    transformations?.push({ type: 'nullAsZero', before, after: value });
  }
  return value;
}

abstract class FormulaValue implements IFormulaValue {

  public token: Token;

  public get origText() {
    if (this.token.origText !== undefined) {
      return this.token.origText;
    }
    return this.token.quoteChar
      ? `${this.token.quoteChar}${this.token.token}${this.token.quoteChar}`
      : this.token.token;
  }

  public set origText(value: string) {
    this.token.origText = value;
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

  public useStepPrecision: boolean = false;

  protected abstract _execute(
    dataSource?: IFormulaDataSource, options?: FormulaValueOptions, forArithmetic?: boolean,
    transformations?: FormulaValueTransformation[],
  ): any;

  public execute(dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean): any {
    options = enterExecution(this, options);
    this.state = FormulaExecuteState.fesExecuting;
    let prom = false;
    try {
      const transformations: FormulaValueTransformation[] | undefined = options.onTrace ? [] : undefined;
      const value = this._execute(dataSource, options, undefined, transformations);
      prom = isPromise(value);
      const _next = (value: any) => {
        this.value = resolveValue(value, options, this, forArithmetic, transformations);
        this.state = FormulaExecuteState.fesExecuted;
        if (options.onTrace) {
          options.onTrace(this, isDecimal(this.value, options) ? this.value.toNumber() : this.value, {
            originalValue: value, value: this.value, transformations: transformations!,
          });
        }
        return this.value;
      };
      if (prom) {
        const result = value.then(_next).catch((e: any) => {
          this.state = FormulaExecuteState.fesExecuted;
          return Promise.reject(e);
        });
        saveExecutionResult(this, options, result);
        return result;
      }
      const result = _next(value);
      saveExecutionResult(this, options, result);
      return result;
    } catch (e) {
      this.state = FormulaExecuteState.fesExecuted;
      throw e;
    }
  }

  constructor(token: Token, options: FormulaValueOptions = {}) {
    this.token = { ...token };
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
