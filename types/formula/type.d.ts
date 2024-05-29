import type Decimal from 'decimal.js';
declare enum TokenType {
    ttNone = 0,
    ttAdd = 1,
    ttMinus = 2,
    ttMul = 3,
    ttDiv = 4,
    ttMod = 5,
    ttPow = 6,
    ttPercent = 7,
    ttAnd = 8,
    ttOr = 9,
    ttNot = 10,
    ttGT = 11,
    ttGE = 12,
    ttLT = 13,
    ttLE = 14,
    ttEQ = 15,
    ttNE = 16,
    ttParenL = 17,
    ttParenR = 18,
    ttListSeparator = 19,
    ttLine = 20,
    ttNull = 21,
    ttNaN = 22,
    ttBool = 23,
    ttFunc = 24,
    ttRef = 25,
    ttName = 26,
    ttNumber = 27,
    ttString = 28,
    ttSpace = 29
}
declare enum FormulaOperatorType {
    fotBinary = 0,
    fotUnaryLeft = 1,
    fotUnaryRight = 2,
    fotQuote = 3
}
declare enum FormulaExecuteState {
    fesNone = 0,
    fesExecuting = 1,
    fesExecuted = 2
}
declare const TokenUnaryLefts: TokenType[];
declare const TokenUnaryRights: TokenType[];
declare const TokenBinarys: TokenType[];
declare const TokenOperators: TokenType[];
declare const TokenNegatives: TokenType[];
declare const TokenPercents: TokenType[];
declare const TokenValues: TokenType[];
interface IFormulaDataSource {
    getParam(name: string, options: FormulaValueOptions): any;
}
type RoundingType = 'UP' | 'DOWN' | 'CEIL' | 'FLOOR' | 'HALF_UP' | 'HALF_DOWN' | 'HALF_EVEN' | 'HALF_CEIL' | 'HALF_FLOOR' | 'EUCLID';
type FormulaValueOptions = {
    Decimal?: typeof Decimal;
    precision?: number;
    rounding?: RoundingType;
    stepRrounding?: boolean | number;
    nullAsZero?: boolean;
    eval?: null | ((expr: string, dataSource: IFormulaDataSource, options: FormulaValueOptions) => any);
};
type FormulaCustomFunctionItem = {
    preExecute?: true;
    argMin: number;
    argMax: number;
    execute: (params: any[], dataSource: IFormulaDataSource, options: FormulaValueOptions) => any;
} | {
    preExecute: false;
    argMin: number;
    argMax: number;
    execute: (params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions) => any;
};
interface IFormulaValue {
    origText: string;
    value: any;
    state: FormulaExecuteState;
    readonly tokenType: TokenType;
    execute(dataSource?: IFormulaDataSource, options?: FormulaValueOptions): any;
}
type FormulaValues = Array<IFormulaValue>;
interface IFormulaParam extends IFormulaValue {
    name: string;
}
interface IFormulaBase extends IFormulaValue {
    name: string;
    params: FormulaValues;
}
interface IFormulaFunction extends IFormulaBase {
    argMin: number;
    argMax: number;
    owner: IFormulaValue | null;
}
interface IFormulaOperator extends IFormulaBase {
    priority: number;
    operatorType: FormulaOperatorType;
}
export { TokenType, FormulaOperatorType, FormulaExecuteState, TokenValues, TokenUnaryLefts, TokenUnaryRights, TokenBinarys, TokenOperators, TokenNegatives, TokenPercents, FormulaValues, };
export type { IFormulaFunction, IFormulaOperator, IFormulaValue, IFormulaBase, IFormulaParam, IFormulaDataSource, FormulaValueOptions, FormulaCustomFunctionItem, RoundingType, };
