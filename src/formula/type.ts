import type Decimal from 'decimal.js';

enum TokenType {
  ttNone,
  ttAdd,
  ttMinus,
  ttMul,
  ttDiv,
  ttMod,
  ttPow,
  ttPercent,
  ttAnd,
  ttOr,
  ttNot,
  ttGT,
  ttGE,
  ttLT,
  ttLE,
  ttEQ,
  ttNE,
  ttParenL,
  ttParenR,
  ttListSeparator,
  ttLine,
  ttNull,
  ttNaN,
  ttBool,
  ttFunc,
  ttRef,
  ttName,
  ttNumber,
  ttString,
  ttSpace,
}


// 操作符类型
enum FormulaOperatorType {
  fotBinary,          // 二元
  fotUnaryLeft,       // 一元
  fotUnaryRight,       // 一元
  fotQuote
}

enum FormulaExecuteState {
  fesNone,
  fesExecuting,
  fesExecuted
}


const TokenUnaryLefts = [TokenType.ttNot];
const TokenUnaryRights = [TokenType.ttPercent];
const TokenBinarys = [
  TokenType.ttAdd,
  TokenType.ttMinus,
  TokenType.ttMul,
  TokenType.ttDiv,
  TokenType.ttMod,
  TokenType.ttPow,
  TokenType.ttAnd,
  TokenType.ttOr,
  TokenType.ttGT,
  TokenType.ttGE,
  TokenType.ttLT,
  TokenType.ttLE,
  TokenType.ttEQ,
  TokenType.ttNE
];


const TokenOperators = [
  TokenType.ttAdd,
  TokenType.ttMinus,
  TokenType.ttMul,
  TokenType.ttDiv,
  TokenType.ttMod,
  TokenType.ttPercent,
  TokenType.ttPow,
  TokenType.ttAnd,
  TokenType.ttOr,
  TokenType.ttNot,
  TokenType.ttGT,
  TokenType.ttGE,
  TokenType.ttLT,
  TokenType.ttLE,
  TokenType.ttEQ,
  TokenType.ttNE,
  TokenType.ttParenL,
];

const TokenNegatives = [
  TokenType.ttNone,
  TokenType.ttSpace,
  TokenType.ttLine,
  TokenType.ttListSeparator,
  ...TokenOperators
];

const TokenPercents = [
  TokenType.ttNone,
  TokenType.ttAdd,
  TokenType.ttMinus,
  TokenType.ttMul,
  TokenType.ttDiv,
  TokenType.ttMod,
  TokenType.ttPercent,
  TokenType.ttPow,
  TokenType.ttAnd,
  TokenType.ttOr,
  TokenType.ttNot,
  TokenType.ttGT,
  TokenType.ttGE,
  TokenType.ttLT,
  TokenType.ttLE,
  TokenType.ttEQ,
  TokenType.ttNE,
  TokenType.ttParenR,
];

const TokenValues = [
  TokenType.ttNull,
  TokenType.ttBool,
  TokenType.ttRef,
  TokenType.ttName,
  TokenType.ttNumber,
  TokenType.ttNaN,
  TokenType.ttString,
];

interface IFormulaDataSource {
  getParam(name: string) : any;
}

type RoundingType = 'UP'|'DOWN'|'CEIL'|'FLOOR'|'HALF_UP'|'HALF_DOWN'|'HALF_EVEN'|'HALF_CEIL'|'HALF_FLOOR'|'EUCLID';

type FormulaValueOptions = {
  Decimal?: typeof Decimal,
  precision?: number,
  rounding?: RoundingType,
  stepRrounding?: boolean|number,
  eval?: null|((expr: string, dataSource: IFormulaDataSource, options:  FormulaValueOptions) => any),
}

type FormulaCustomFunctionItem = {
  preExecute?: true,
  argMin: number
  argMax: number;
  execute: (params: any[], dataSource: IFormulaDataSource, options: FormulaValueOptions) => any
} | {
  preExecute: false,
  argMin: number
  argMax: number;
  execute: (params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions) => any
}

interface IFormulaValue {
  origText: string;
  value: any,
  state: FormulaExecuteState,
  readonly tokenType: TokenType;
  execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions): any;
}

type FormulaValues = Array<IFormulaValue>;


interface IFormulaParam extends IFormulaValue {
  name: string,
}

interface IFormulaBase extends IFormulaValue {
  name: string ;

  params: FormulaValues;
}


interface IFormulaFunction extends IFormulaBase {
  argMin: number;
  argMax: number;

  owner: IFormulaValue|null;
}

interface IFormulaOperator extends IFormulaBase {
  isUnComplete: Boolean;
  /**
  * 优先级
  * */
  priority: number;
  /**
  * 运算符类型
  * */
  operatorType: FormulaOperatorType;
}


export {
  TokenType,
  FormulaOperatorType,
  FormulaExecuteState,

  TokenValues,
  TokenUnaryLefts,
  TokenUnaryRights,
  TokenBinarys,
  TokenOperators,
  TokenNegatives,
  TokenPercents,

  FormulaValues,
};

export type {
  IFormulaFunction,
  IFormulaOperator,
  IFormulaValue,
  IFormulaBase,
  IFormulaParam,
  IFormulaDataSource,
  FormulaValueOptions,
  FormulaCustomFunctionItem,
  RoundingType,
};
