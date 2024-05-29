

import Tokenizer from './tokenizer';
import {
  TokenType, FormulaOperatorType,
  FormulaValues, TokenOperators, TokenValues, FormulaValueOptions,
  FormulaExecuteState
} from './type';
import type {
  IFormulaValue, IFormulaDataSource, IFormulaOperator, IFormulaFunction,
  FormulaCustomFunctionItem
} from './type';
import AbsFormulaFunction from './base/function';
import { createFormulaFunction, registorFormulaFunction } from './functions';
import { createFormulaOperator, isFormulaOperator } from './operators';
import FormulaOperatorPAREN from './operators/paren';
import FormulaNull from './values/null';
import FormulaBool from './values/bool';
import FormulaNumber from './values/number';
import FormulaString from './values/string';
import FormulaParam from './values/param';
import FormulaRef from './values/ref';
import FormulaNaN from './values/nan';
import { ERROR_FORMULA_STR } from './constant';

interface FormulaOptions extends FormulaValueOptions {

}

function isOperatorUncomplete(operator: IFormulaOperator) {
  return ([FormulaOperatorType.fotUnaryLeft, FormulaOperatorType.fotUnaryRight].includes(operator.operatorType) && (operator.params.length < 1))
    || ((operator.operatorType === FormulaOperatorType.fotBinary) && (operator.params.length < 2));
}

class Formula {

  public lastError: string = '';

  public origText: string = '';

  public tokenizer: Tokenizer;

  public formulas: FormulaValues = [];

  public refs: FormulaValues = [];

  public customFunctions: Record<string, FormulaCustomFunctionItem> = {};

  constructor() {
    this.tokenizer = new Tokenizer();
  }

  public registorFunction: typeof registorFormulaFunction = (originFuncName, item, options = {}) => registorFormulaFunction(originFuncName, item, {
    ...options,
    customFunctions: this.customFunctions,
  })

  clear() {
    this.lastError = '';
    this.origText = '';
    this.formulas.splice(0, this.formulas.length);
    const refs = this.refs.splice(0, this.refs.length);
    refs.forEach(value => value.state = FormulaExecuteState.fesNone);
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

      return this.verify(options);
    } catch (error: any) {
      this.lastError = error.message;
      throw error;
    }
  }

  expression(options: FormulaOptions) {
    let tokenizer = this.tokenizer;
    const formulas = this.formulas;
    const refs = this.refs;
    const customFunctions = this.customFunctions;
    try {
      this.lastError = '';
      let operatorLast: IFormulaOperator|null = null;
      let operatorPrev: IFormulaOperator|null = null;
      let operator: IFormulaOperator|null = null;
      let i = 0;
      while (i < tokenizer.items.length) {
        let tokenItem = tokenizer.items[i];
        let tokenType = tokenItem.tokenType;
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
          const func = createFormulaFunction(tokenItem.token, options, {
            customFunctions,
          });
          formulas.push(func);

          // check the nearest operator;
          if (operatorLast) {
            if (operatorLast.operatorType === FormulaOperatorType.fotUnaryLeft) {
              operatorLast.params.push(func);
              func.owner = operatorLast;
            } else if ((operatorLast.operatorType === FormulaOperatorType.fotBinary) && (operatorLast.params.length < 2)) {
              // if (operatorLast.params.length !== 1) {
              //   throw new Error(ERROR_FORMULA_STR + '!');
              // }
              operatorLast.params.push(func);
              func.owner = operatorLast;
            }
          }

          operatorLast = null;
        } else  if (tokenType === TokenType.ttParenR) { // if it is a right parenthesis
          if (operatorLast && ([FormulaOperatorType.fotBinary, FormulaOperatorType.fotUnaryLeft].includes(operatorLast.operatorType))) {
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
            let func = formulas[j - 1] as IFormulaFunction;

            // remove func from refs list
            let idx = refs.indexOf(paren);
            if (~idx) {
              refs.splice(idx, 1);
            }

            let k = formulas.length - 1;
            while (k > j) {
              let formulaValue = formulas[k];
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
          } else {
            let k = formulas.length - 1;
            while (k > j) {
              item = formulas[k];
              operator.params.unshift(item);
              formulas.splice(k, 1);
              k--;
            }
            paren.closed = true;
            paren.origText = tokenizer.value.substr(paren.tokenIndex, tokenItem.index + 1 - paren.tokenIndex);
          }

          if ((j - 1 >= 0) && isFormulaOperator(formulas[j - 1], v => operator = v)) {
            if (operator && [FormulaOperatorType.fotUnaryLeft, FormulaOperatorType.fotBinary].includes(operator.operatorType)) {
              if (isOperatorUncomplete(operator)) {
                operator.params.push(formulas[j]);
                formulas.splice(j, 1);
              } else {
                let operatorTemp2: IFormulaOperator|null = null;
                let operatorTemp1: IFormulaOperator|null = operator;
                do {
                  if (isOperatorUncomplete(operatorTemp1)) {
                    operatorTemp2 = operatorTemp1;
                  }
                } while (isFormulaOperator(operatorTemp1.params[operatorTemp1.params.length - 1], v => operatorTemp1 = v));

                if (operatorTemp2) {
                  operatorTemp2.params.push(formulas[j]);
                  formulas.splice(j, 1);
                }
              }
            }
          }

          operatorLast = null;
        } else
        // if it is an operator
        if (TokenOperators.includes(tokenType)) {
          operator = createFormulaOperator(tokenType, tokenItem.token, tokenItem.index, options);
          // check if the previous one is an operator
          if (formulas.length) {
            operatorPrev = isFormulaOperator(formulas[formulas.length - 1])
              ? formulas[formulas.length - 1] as IFormulaOperator
              : null;
          }
          if (operator.tokenType === TokenType.ttParenL) {
            refs.push(operator);
          }

          // ff it is a left monocular operator
          if (operator.operatorType === FormulaOperatorType.fotUnaryLeft) {
            if (operatorLast
              && ([FormulaOperatorType.fotUnaryLeft, FormulaOperatorType.fotBinary].includes(operatorLast.operatorType))
              &&  isOperatorUncomplete(operatorLast)) {
              operatorLast.params.push(operator);
            } else {
              formulas.push(operator);
            }
          } else
          // if it is a right monocular or binocular operator
          if ([
            FormulaOperatorType.fotUnaryRight,
            FormulaOperatorType.fotBinary
          ].includes(operator.operatorType)) {
            if (!formulas.length) {
              throw new Error(ERROR_FORMULA_STR + '!');
            }
            // compare priority with the previous operator
            if (operatorPrev
              && ([FormulaOperatorType.fotUnaryLeft, FormulaOperatorType.fotBinary].includes(operatorPrev.operatorType))
              && (operator.priority > operatorPrev.priority)) {
              if (isOperatorUncomplete(operatorPrev)) {
                throw new Error(ERROR_FORMULA_STR + '!');
              }

              let operatorTemp1: IFormulaOperator = operatorPrev;
              while (isFormulaOperator(operatorTemp1.params[operatorTemp1.params.length - 1], v => {
                v && (operatorTemp1 = v);
              })
              && operatorTemp1.priority < operator.priority) {
                // empty
              }
              operator.params.push(operatorTemp1.params[operatorTemp1.params.length - 1]);
              operatorTemp1.params[operatorTemp1.params.length - 1] = operator as IFormulaOperator;
            } else {
              if (operatorPrev === formulas[formulas.length - 1] && isOperatorUncomplete(operatorPrev)) {
                throw new Error(ERROR_FORMULA_STR + '!');
              }
              operator.params.push(formulas[formulas.length - 1]);
              formulas.pop();
              formulas.push(operator);
            }
          } else
          // if it is a left parenthesis, it is directly pushed to the symbol stack;
          if (operator && [TokenType.ttParenL].includes(tokenType)) {
            formulas.push(operator);
          }

          operatorLast = operator;
        } else
        // If it is a literal value
        if (TokenValues.includes(tokenType)) {
          item = null;
          if (tokenType === TokenType.ttNull) {
            item = new FormulaNull(tokenItem.token, options);
          } else if (tokenType === TokenType.ttBool) {
            item = new FormulaBool(tokenItem.token, options);
          } else if (tokenType === TokenType.ttNumber) {
            item = new FormulaNumber(tokenItem.token, options);
          } else if (tokenType === TokenType.ttNaN) {
            item = new FormulaNaN(tokenItem.token, options);
          } else if (tokenType === TokenType.ttString) {
            item = new FormulaString(`"${tokenItem.token}"`, tokenItem.token, options);
          } else if (tokenType === TokenType.ttRef) {
            item = new FormulaRef(tokenItem.token, refs, options);
          }  else if (tokenType === TokenType.ttName) {
            item = new FormulaParam(tokenItem.token, tokenItem.token, tokenItem.tokenType, options);
          }

          // If the previous one was an operator
          if (item) {
            if (operatorLast) {
              if (operatorLast.operatorType === FormulaOperatorType.fotUnaryLeft) {
                operatorLast.params.push(item);
              } else
              if ((operatorLast.operatorType === FormulaOperatorType.fotBinary)
                && (operatorLast.params.length < 2)) {
                // if (operatorLast.params.length !== 1) {
                //   throw new Error(ERROR_FORMULA_STR + '!');
                // }
                operatorLast.params.push(item);
              } else formulas.push(item);
            } else formulas.push(item);
          }

          operatorLast = null;
        }

        i++;
      }
    } catch (e: any) {
      this.lastError = `'[Formula.expression][${this.origText}]${e.message}`;
      throw e;
    }
  }

  private verifyFormulaCount() {
    if (this.formulas.length !== 1) {
      throw new Error(ERROR_FORMULA_STR + ': contains multiple formula expressions');
    }
  }

  private verify(options: FormulaOptions = {}) {
    this.lastError = '';
    const formulas = this.formulas;

    if (formulas.length < 1) {
      throw new Error('The formula is empty!');
    }

    for (let i = 0; i < this.formulas.length; i++) {
      let item = formulas[i];
      if (item.tokenType === TokenType.ttParenL) {
        if (!(item as FormulaOperatorPAREN).closed) {
          throw new Error(ERROR_FORMULA_STR + ': there are unclosed parentheses!');
        }
      }

      // if (item.tokenType === TokenType.ttFunc) {
      //   if ((item as IFormulaFunction).owner) {
      //     throw new Error(ERROR_FORMULA_STR + `: function [${item.origText}] parsing incorrect!`);
      //   }
      // }
    }
    this.verifyFormulaCount();
  }

  execute(dataSource?: IFormulaDataSource, options: FormulaValueOptions = {}) {
    try {
      this.lastError = '';
      this.verifyFormulaCount();
      return this.formulas[0].execute(dataSource, options);
    } catch (error: any) {
      this.lastError = error.message;
      throw error;
    }
  }

}

export {
  AbsFormulaFunction,
  registorFormulaFunction,
  TokenType,
};

export type {
  IFormulaFunction,
  IFormulaDataSource,
  FormulaOptions,
  FormulaCustomFunctionItem,
};

export default Formula;
