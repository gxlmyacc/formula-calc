

import {
  TokenType,
  FormulaOperatorType,
  Token,
} from '../type';
import type {
  FormulaValueOptions,
  IFormulaOperator,
} from '../type';
import type AbsFormulaOperator from '../base/operator';
import FormulaOperatorADD from './add';
import FormulaOperatorMINUS from './minus';
import FormulaOperatorMUL from './mul';
import FormulaOperatorDIV from './div';
import FormulaOperatorDIVINT from './divInt';
import FormulaOperatorAND from './and';
import FormulaOperatorOR from './or';
import FormulaOperatorNOT from './not';
import FormulaOperatorIF from './if';
import FormulaOperatorGT from './gt';
import FormulaOperatorGE from './ge';
import FormulaOperatorLT from './lt';
import FormulaOperatorLE from './le';
import FormulaOperatorEQ from './eq';
import FormulaOperatorNE from './ne';
import FormulaOperatorPAREN from './paren';
import FormulaOperatorPOW from './pow';
import FormulaOperatorMOD from './mod';
import FormulaOperatorPERCENT from './percent';

type FormulaOperatorItem = {
  operatorType: FormulaOperatorType;
  operatorToken: TokenType;
  priority: number;
  operatorClass: typeof AbsFormulaOperator;
}

const FormulaOperatorArray : Array<FormulaOperatorItem> = [
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttAdd, priority: 4, operatorClass: FormulaOperatorADD },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttMinus, priority: 4, operatorClass: FormulaOperatorMINUS },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttMul, priority: 5, operatorClass: FormulaOperatorMUL },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttDiv, priority: 5, operatorClass: FormulaOperatorDIV },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttDivInt, priority: 5, operatorClass: FormulaOperatorDIVINT },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttMod, priority: 5, operatorClass: FormulaOperatorMOD },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttPow, priority: 7, operatorClass: FormulaOperatorPOW },
  { operatorType: FormulaOperatorType.fotUnaryRight, operatorToken: TokenType.ttPercent, priority: 8, operatorClass: FormulaOperatorPERCENT },

  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttAnd, priority: 3, operatorClass: FormulaOperatorAND },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttOr, priority: 3, operatorClass: FormulaOperatorOR },
  { operatorType: FormulaOperatorType.fotUnaryLeft, operatorToken: TokenType.ttNot, priority: 6, operatorClass: FormulaOperatorNOT },

  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttGT, priority: 2, operatorClass: FormulaOperatorGT },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttGE, priority: 2, operatorClass: FormulaOperatorGE },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttLT, priority: 2, operatorClass: FormulaOperatorLT },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttLE, priority: 2, operatorClass: FormulaOperatorLE },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttEQ, priority: 2, operatorClass: FormulaOperatorEQ },
  { operatorType: FormulaOperatorType.fotBinary, operatorToken: TokenType.ttNE, priority: 2, operatorClass: FormulaOperatorNE },
  { operatorType: FormulaOperatorType.fotTernary, operatorToken: TokenType.ttIf, priority: 2, operatorClass: FormulaOperatorIF },

  { operatorType: FormulaOperatorType.fotQuote, operatorToken: TokenType.ttParenL, priority: 1, operatorClass: FormulaOperatorPAREN },
];


// 创建一个计算公式运算符
function createFormulaOperator(
  token: Token,
  options?: FormulaValueOptions
): IFormulaOperator {
  const item = FormulaOperatorArray.find((item) => item.operatorToken === token.tokenType);
  // if (!item) {
  //   throw new Error(`unsupported operator: "${operatorToken}"unsupported operator: "${operatorToken}"`);
  // }
  const OperatorClass = (item as FormulaOperatorItem).operatorClass;
  // @ts-ignore
  return new OperatorClass(token, options, item.operatorType, item.priority);
}

function isFormulaOperator(value: any, onSupport?: (value: IFormulaOperator|null) => void): value is IFormulaOperator {
  const ret = value && (value as IFormulaOperator).operatorType != null;
  onSupport && onSupport(ret ? value : null);
  return ret;
}

export {
  createFormulaOperator,
  isFormulaOperator
};
