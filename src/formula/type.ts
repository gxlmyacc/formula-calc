import type Decimal from 'decimal.js';

enum TokenType {
  /** none */
  ttNone,
  /** + */
  ttAdd,
  /** - */
  ttMinus,
  /** * */
  ttMul,
  /** / */
  ttDiv,
  /** // */
  ttDivInt,
  /** % */
  ttMod,
  /** ^ */
  ttPow,
  /** % */
  ttPercent,
  /** & */
  ttAnd,
  /** | */
  ttOr,
  /** ! */
  ttNot,
  /** > */
  ttGT,
  /** >= */
  ttGE,
  /** < */
  ttLT,
  /** <= */
  ttLE,
  /** = */
  ttEQ,
  /** != */
  ttNE,
  /** ( */
  ttParenL,
  /** ) */
  ttParenR,
  /** , */
  ttListSeparator,
  /** \n */
  ttLine,
  /** null */
  ttNull,
  /** NaN */
  ttNaN,
  /** true */
  ttBool,
  /** function */
  ttFunc,
  /** ref */
  ttRef,
  /** name */
  ttName,
  /** number */
  ttNumber,
  /** string */
  ttString,
  /** space */
  ttSpace,
  /** if */
  ttIf,
  /** else */
  ttIfElse
}

interface Token {
  token: string;
  /** Exact source text for a parsed formula node. */
  origText?: string;
  tokenType: TokenType;
  quoteChar: string;
  index: number,
  column: number,
  line: number,
  length: number;
}

enum FormulaOperatorType {
  fotBinary,
  fotUnaryLeft,
  fotUnaryRight,
  fotQuote,
  fotTernary
}

enum FormulaExecuteState {
  fesNone,
  fesExecuting,
  fesExecuted
}


const TokenUnaryLefts = [TokenType.ttNot];
const TokenUnaryRights = [TokenType.ttPercent];
const TokenBinaries = [
  TokenType.ttAdd,
  TokenType.ttMinus,
  TokenType.ttMul,
  TokenType.ttDiv,
  TokenType.ttDivInt,
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
  TokenType.ttDivInt,
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
  TokenType.ttIf,
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
  TokenType.ttDivInt,
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
  TokenType.ttListSeparator,
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

const OperatorWithRightParams = [
  FormulaOperatorType.fotUnaryLeft,
  FormulaOperatorType.fotBinary,
  FormulaOperatorType.fotTernary
];
const OperatorWithLeftParams = [
  FormulaOperatorType.fotUnaryRight,
  FormulaOperatorType.fotBinary,
  FormulaOperatorType.fotTernary
];

interface IFormulaDataSource {
  getParam(name: string, options: FormulaValueOptions, forArithmetic?: boolean) : any;
}

type RoundingType = 'UP'|'DOWN'|'CEIL'|'FLOOR'|'HALF_UP'|'HALF_DOWN'|'HALF_EVEN'|'HALF_CEIL'|'HALF_FLOOR'|'EUCLID';

type FormulaValueTransformation = {
  type: 'nullAsZero'|'stepPrecision'|'round';
  before: any;
  after: any;
  /** Decimal places applied to the stored value (percentage ratios include two extra places). */
  precision?: number;
};

type FormulaTraceDetails = {
  originalValue: any;
  value: any;
  transformations: FormulaValueTransformation[];
};

type FormulaValueOptions = {
  Decimal?: typeof Decimal,
  precision?: number,
  rounding?: RoundingType,
  stepPrecision?: boolean|number|((item: IFormulaValue, value: any) => boolean|number),
  stepPrecisionIgnorePercent?: boolean,
  tryStringToNumber?: boolean,
  /** Skip step rounding for numeric literals. Defaults to true. */
  ignoreRoundingOriginalValue?: boolean,
  /** Skip step rounding for parameters. Defaults to true; a callback controls each parameter independently. */
  ignoreRoundingParams?: boolean|((name: string) => boolean)
  returnDecimal?: boolean,
  nullAsZero?: boolean,
  nullIfParamNotFound?: boolean,
  eval?: null|((expr: string, dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any),
  /** The optional third argument preserves exact values and records actual conversions and rounding. */
  onTrace?: (item: IFormulaValue, value: any, details?: FormulaTraceDetails) => void,
}

type FormulaCustomFunctionItem = {
  /** Apply global stepPrecision to numeric results. Defaults to true, independently of arithmetic. */
  useStepPrecision?: boolean,
  preExecute?: true,
  arithmetic?: boolean,
  mayChange?: boolean,
  argMin: number
  argMax: number;
  execute: (params: any[], dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any
} | {
  preExecute: false,
  useStepPrecision?: boolean,
  arithmetic?: boolean,
  mayChange?: boolean,
  argMin: number
  argMax: number;
  execute: (params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any
}

interface IFormulaValue {
  token: Token;
  readonly origText: string;
  readonly line: number;
  readonly column: number;
  value: any,
  name: string,
  state: FormulaExecuteState,
  readonly arithmetic: boolean,
  readonly tokenType: TokenType,
  readonly mayChange: boolean,
  readonly useStepPrecision?: boolean,
  execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions, forArithmetic?: boolean): any;
}

type FormulaValues = Array<IFormulaValue>;


interface IFormulaParam extends IFormulaValue {
  name: string,
}

interface IFormulaBase extends IFormulaValue {
  params: FormulaValues;
}


interface IFormulaFunction extends IFormulaBase {
  origText: string;
  argMin: number;
  argMax: number;
  owner: IFormulaValue|null;
}

interface IFormulaOperator extends IFormulaBase {
  priority: number;
  operatorType: FormulaOperatorType;

  readonly paramsCount: number|null;
}

export {
  TokenType,
  FormulaOperatorType,
  FormulaExecuteState,

  TokenValues,
  TokenUnaryLefts,
  TokenUnaryRights,
  TokenBinaries,
  TokenOperators,
  TokenNegatives,
  TokenPercents,
  OperatorWithRightParams,
  OperatorWithLeftParams,

  FormulaValues,
};

export type {
  Token,
  IFormulaFunction,
  IFormulaOperator,
  IFormulaValue,
  IFormulaBase,
  IFormulaParam,
  IFormulaDataSource,
  FormulaValueOptions,
  FormulaValueTransformation,
  FormulaTraceDetails,
  FormulaCustomFunctionItem,
  RoundingType,
};
