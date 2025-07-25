

import Decimal from 'decimal.js';
import Tokenizer from './tokenizer';
import {
  TokenType, FormulaOperatorType, OperatorWithRightParams, OperatorWithLeftParams,
  FormulaValues, TokenOperators, FormulaValueOptions,
  FormulaExecuteState
} from './type';
import type {
  IFormulaValue, IFormulaDataSource, IFormulaOperator, IFormulaFunction,
  FormulaCustomFunctionItem,
  Token
} from './type';
import AbsFormulaFunction from './base/function';
import { createFormulaFunction, registerFormulaFunction } from './functions';
import { createFormulaOperator, isFormulaOperator } from './operators';
import FormulaOperatorPAREN from './operators/paren';
import FormulaOperatorIF from './operators/if';
import FormulaNull from './values/null';
import FormulaBool from './values/bool';
import FormulaNumber from './values/number';
import FormulaString from './values/string';
import FormulaParam from './values/param';
import FormulaRef from './values/ref';
import FormulaNaN from './values/nan';
import { ERROR_FORMULA_STR } from './constant';
import { isDecimal, isDecimalValue, isNumber, nextWithPromise, removeFormArray, toRound } from './utils';

interface FormulaOptions extends FormulaValueOptions {
  onCreateParam?: (token: Token, options: FormulaValueOptions) => IFormulaValue;
}

function isOperatorUnComplete(operator: IFormulaOperator) {
  return operator.paramsCount !== null && operator.params.length < operator.paramsCount;
}

function resolveNearOperator(operatorNear: IFormulaOperator|null, item: IFormulaValue)  {
  let result = false;
  // If the previous one was an operator
  if (operatorNear && OperatorWithRightParams.includes(operatorNear.operatorType)) {
    operatorNear.params.push(item);
    result = true;
  }
  return result;
}

function getPrevOperator(formulas: FormulaValues) {
  return formulas.length && isFormulaOperator(formulas[formulas.length - 1])
    ? formulas[formulas.length - 1] as IFormulaOperator
    : null;
}

class Formula {

  public lastError: string = '';

  public origText: string = '';

  public tokenizer: Tokenizer;

  public formulas: FormulaValues = [];

  public operators: IFormulaOperator[] = [];

  public refs: FormulaValues = [];

  public customFunctions: Record<string, FormulaCustomFunctionItem> = {};

  constructor() {
    this.tokenizer = new Tokenizer();
  }

  public registerFunction: typeof registerFormulaFunction = (originFuncName, item, options = {}) => registerFormulaFunction(originFuncName, item, {
    ...options,
    customFunctions: this.customFunctions,
  });


  private expression(options: FormulaOptions) {
    const tokenizer = this.tokenizer;
    const formulas = this.formulas;
    const refs = this.refs;
    const customFunctions = this.customFunctions;
    try {
      this.lastError = '';
      let operatorNear: IFormulaOperator|null = null;
      let operator: IFormulaOperator|null = null;
      let i = 0;
      while (i < tokenizer.items.length) {
        const tokenItem = tokenizer.items[i];
        const tokenType = tokenItem.tokenType;
        let item: IFormulaValue|null = null;

        if ([
          TokenType.ttLine,
          TokenType.ttListSeparator
        ].includes(tokenType)) {
          i++;
          continue;
        }

        // if it is a function name, directly put it into the symbol stack;
        if (tokenType === TokenType.ttFunc) {
          const func = createFormulaFunction(tokenItem.token, tokenItem, options, {
            customFunctions,
          });
          formulas.push(func);

          // check the nearest operator;
          if (resolveNearOperator(operatorNear, func)) {
            func.owner = operatorNear;
          }
          operatorNear = null;
        } else  if (tokenType === TokenType.ttParenR) { // if it is a right parenthesis
          if (operatorNear && (OperatorWithRightParams.includes(operatorNear.operatorType))) {
            throw new Error(ERROR_FORMULA_STR + '!');
          }

          let j = formulas.length - 1;
          while (
            (j >= 0) && !(
              (formulas[j].tokenType === TokenType.ttParenL)
            && !(formulas[j] as FormulaOperatorPAREN).closed
            )) {
            j--;
          }
          if (j < 0) {
            throw new Error(ERROR_FORMULA_STR + ': No matching "(" was found for ")"');
          }
          operator = formulas[j] as IFormulaOperator;
          const paren = formulas[j] as FormulaOperatorPAREN;
          // if there is a function before the left parenthesis, it indicates that it is a function
          if ((j - 1 >= 0) && (formulas[j - 1].tokenType === TokenType.ttFunc)) {
            const func = formulas[j - 1] as IFormulaFunction;

            // remove func from refs list
            removeFormArray(refs, paren);

            let k = formulas.length - 1;
            while (k > j) {
              const formulaValue = formulas[k];
              func.params.unshift(formulaValue);
              formulas.splice(k, 1);
              k--;
            }

            formulas.splice(j, 1);
            j--;

            if (func.owner) {
              formulas.splice(j, 1);
              i++;
              continue;
            }
            func.origText = tokenizer.value.substr(func.token.index, tokenItem.index + 1 - func.token.index);
          } else {
            let k = formulas.length - 1;
            while (k > j) {
              item = formulas[k];
              operator.params.unshift(item);
              formulas.splice(k, 1);
              k--;
            }
            paren.closed = true;
            paren.origText = tokenizer.value.substr(paren.token.index, tokenItem.index + 1 - paren.token.index);
          }

          if ((j - 1 >= 0) && isFormulaOperator(formulas[j - 1], (v) => operator = v)) {
            if (operator && OperatorWithRightParams.includes(operator.operatorType)) {
              if (isOperatorUnComplete(operator)) {
                operator.params.push(formulas[j]);
                formulas.splice(j, 1);
              } else {
                let operatorTemp2: IFormulaOperator|null = null;
                let operatorTemp1: IFormulaOperator|null = operator;
                do {
                  if (isOperatorUnComplete(operatorTemp1)) {
                    operatorTemp2 = operatorTemp1;
                  }
                } while (isFormulaOperator(operatorTemp1.params[operatorTemp1.params.length - 1], (v) => operatorTemp1 = v));

                if (operatorTemp2) {
                  operatorTemp2.params.push(formulas[j]);
                  formulas.splice(j, 1);
                }
              }
            }
          }

          operatorNear = null;
        } else if (tokenType === TokenType.ttIfElse) {
          if (operatorNear && (OperatorWithRightParams.includes(operatorNear.operatorType))) {
            throw new Error(ERROR_FORMULA_STR + '!');
          }
          const operatorPrev = getPrevOperator(formulas);
          if (!operatorPrev
            || operatorPrev.tokenType !== TokenType.ttIf
            || operatorPrev.params.length !== 2) {
            throw new Error(ERROR_FORMULA_STR + '!');
          }
          (operatorPrev as FormulaOperatorIF).withElse = true;
          operatorNear = operatorPrev;
        } else
        // if it is an operator
        if (TokenOperators.includes(tokenType)) {
          operator = createFormulaOperator(tokenItem, options);
          this.operators.push(operator);

          // check if the previous one is an operator
          const operatorPrev = getPrevOperator(formulas);

          if (operator.tokenType === TokenType.ttParenL) {
            refs.push(operator);
          }

          // if it is a left monocular operator
          if (operator.operatorType === FormulaOperatorType.fotUnaryLeft) {
            if (operatorNear
              && (OperatorWithRightParams.includes(operatorNear.operatorType))
              &&  isOperatorUnComplete(operatorNear)) {
              operatorNear.params.push(operator);
            } else {
              formulas.push(operator);
            }
          } else
          // if it is a right monocular or binocular operator
          if (OperatorWithLeftParams.includes(operator.operatorType)) {
            if (!formulas.length) {
              throw new Error(ERROR_FORMULA_STR + '!');
            }
            // compare priority with the previous operator
            if (operatorPrev
              && (OperatorWithRightParams.includes(operatorPrev.operatorType))
              && (operator.priority > operatorPrev.priority)) {
              if (isOperatorUnComplete(operatorPrev) && (
                operatorPrev.tokenType !== TokenType.ttIf
                || (operatorPrev as FormulaOperatorIF).withElse
                || operatorPrev.params.length < 1
              )) {
                throw new Error(ERROR_FORMULA_STR + '!');
              }

              let operatorTemp1: IFormulaOperator = operatorPrev;
              while (isFormulaOperator(operatorTemp1.params[operatorTemp1.params.length - 1], (v) => {
                v && (operatorTemp1 = v);
              })
              && operatorTemp1.priority < operator.priority
              && OperatorWithRightParams.includes(operatorTemp1.operatorType)) {
                // empty
              }
              operator.params.push(operatorTemp1.params[operatorTemp1.params.length - 1]);
              operatorTemp1.params[operatorTemp1.params.length - 1] = operator as IFormulaOperator;
            } else {
              if (operatorPrev === formulas[formulas.length - 1] && isOperatorUnComplete(operatorPrev)) {
                throw new Error(ERROR_FORMULA_STR + '!');
              }
              operator.params.push(formulas[formulas.length - 1]);
              formulas.pop();
              formulas.push(operator);
            }
          } else /** if ([TokenType.ttParenL].includes(tokenType)) */ { // if it is a left parenthesis, it is directly pushed to the symbol stack;
            formulas.push(operator);
          }

          operatorNear = operator;
        } else /* if (TokenValues.includes(tokenType)) */ { // If it is a literal value
          item = null;
          if (tokenType === TokenType.ttNull) {
            item = new FormulaNull(tokenItem, options);
          } else if (tokenType === TokenType.ttBool) {
            item = new FormulaBool(tokenItem, options);
          } else if (tokenType === TokenType.ttNumber) {
            item = new FormulaNumber(tokenItem, options);
          } else if (tokenType === TokenType.ttNaN) {
            item = new FormulaNaN(tokenItem, options);
          } else if (tokenType === TokenType.ttString) {
            item = new FormulaString(tokenItem, options);
          } else if (tokenType === TokenType.ttRef) {
            item = new FormulaRef(tokenItem, refs, options);
          } else /* if (tokenType === TokenType.ttName) */{
            item = options.onCreateParam
              ? options.onCreateParam(tokenItem, options)
              : new FormulaParam(tokenItem, options);
          }

          // If the previous one was an operator
          if (!resolveNearOperator(operatorNear, item)) {
            formulas.push(item);
          }
          operatorNear = null;
        }

        i++;
      }
    } catch (e: any) {
      this.lastError = e.message;
      throw e;
    }
  }

  private verifyFormulaCount() {
    if (this.formulas.length !== 1) {
      throw new Error(ERROR_FORMULA_STR + ': contains multiple formula expressions');
    }
  }

  private verify() {
    this.lastError = '';
    const formulas = this.formulas;

    if (formulas.length < 1) {
      throw new Error('The formula is empty!');
    }

    for (let i = 0; i < this.formulas.length; i++) {
      const item = formulas[i];
      if (item.tokenType === TokenType.ttParenL) {
        if (!(item as FormulaOperatorPAREN).closed) {
          throw new Error(ERROR_FORMULA_STR + ': unclosed parentheses!');
        }
      }

      // if (item.tokenType === TokenType.ttFunc) {
      //   if ((item as IFormulaFunction).owner) {
      //     throw new Error(ERROR_FORMULA_STR + `: function [${item.origText}] parsing incorrect!`);
      //   }
      // }
    }
    this.operators.forEach((operator) => {
      if (isOperatorUnComplete(operator)) {
        // eslint-disable-next-line max-len
        throw new Error(ERROR_FORMULA_STR + `: not complete operator "${operator.name}": expected ${operator.paramsCount} parameters, but got ${operator.params.length}!`);
      }
    });
    this.verifyFormulaCount();
  }

  clear() {
    this.lastError = '';
    this.origText = '';
    this.formulas.splice(0, this.formulas.length);
    this.operators.splice(0, this.operators.length);
    const refs = this.refs.splice(0, this.refs.length);
    refs.forEach((value) => value.state = FormulaExecuteState.fesNone);
  }

  parse(formula: string, options: FormulaOptions = {}) {
    this.clear();
    try {
      this.origText = formula;
      this.tokenizer.tokenize(formula);
      if (this.tokenizer.lastError) {
        throw new Error(this.tokenizer.lastError);
      }

      this.expression({ ...options });

      return this.verify();
    } catch (error: any) {
      this.lastError = error.message;
      throw error;
    }
  }

  private _execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions) {
    try {
      this.lastError = '';
      this.verifyFormulaCount();
      return this.formulas[0].execute(dataSource, options);
    } catch (error: any) {
      this.lastError = error.message;
      throw error;
    }
  }

  execute(dataSource?: IFormulaDataSource, options: FormulaValueOptions = {}) {
    return nextWithPromise(
      this._execute(dataSource, options),
      (result) => {
        const _resolveResult = (result: any): any => {
          if (Array.isArray(result)) {
            return result.map(_resolveResult);
          }
          if (isNumber(options.precision)
            && (
              (isNumber(result) && !isNaN(result))
              || (isDecimal(result, options) && !result.isNaN())
            )
          ) {
            result = toRound(result, options.precision, options.rounding);
          }
          if (isDecimal(result, options)) {
            if (!options.returnDecimal) {
              result = result.toNumber();
              if (Object.is(result, -0)) result = 0;
            }
          } else if (isDecimalValue(result, options)) {
            if (options.returnDecimal) {
              result =  new (options.Decimal || Decimal)(result);
            }
          }
          return result;
        };
        result = _resolveResult(result);
        return result;
      },
      false
    );
  }

}

export {
  AbsFormulaFunction,
  registerFormulaFunction,
  TokenType,
};

export type {
  IFormulaFunction,
  IFormulaDataSource,
  FormulaOptions,
  FormulaCustomFunctionItem,
};

export default Formula;
