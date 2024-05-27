import { TokenType } from './type';
interface Token {
    token: string;
    tokenType: TokenType;
    index: number;
    length: number;
}
type TokenErrorEvent = (errorId: number, errorStr: string) => void;
declare class Tokenizer {
    items: Array<Token>;
    onTokenError: TokenErrorEvent | null;
    lastError: string;
    value: string;
    private len;
    get length(): number;
    getLast(lastIndex?: number): TokenType;
    push(item: Token): void;
    changeLast(tokenType: TokenType, index?: number): void;
    clear(): void;
    addOperator(token: string, tokenType: TokenType, index: number, length: number): number;
    doTokenError(errorId: number, errorStr: string): void;
    doNumber(i: number): number;
    doQuoted(i: number, quoteChar: string, tokenType: TokenType, errorCode: number): number;
    doString(i: number): number;
    doQuotedName(i: number): number;
    doRef(i: number): number;
    doName(i: number): number;
    tokenize(value: string): void;
}
export default Tokenizer;
