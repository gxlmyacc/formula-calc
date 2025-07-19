import {
  ERR_ILLEGAL_NUMBER,
  ERR_STR_MISSING_Q,
  ERR_QUOTED_NAME_MISSING_Q,
  ERR_INVALID_REF,
  REGX_NAME_CHAR,
  ERR_ILLEGAL_CHAR,
} from './constant';
import { TokenType, TokenNegatives, TokenPercents, Token } from './type';


const DecimalSeparator = '.';
const ListSeparator = ',';
const EscapeChar = '\\';
const StringQuoteChar = '"';
const NameQuoteChar = "'";

const SPACE_SEPARATOR = [
  ' ', '\t', '\n', '\r',
];

const NAME_SEPARATOR = [
  ListSeparator, '\\',
  '/', '?', ':', '*', '[',
  ']', '+', '&',
  '-', '*', '/', '%',
  '^', '<', '>', '=',
  '(', ')', '#', '{', '}',
  "'", '"', '!',
  ...SPACE_SEPARATOR
];


const LITERAL_MAP: Record<
  string,
  Array<{ label: string, tokenType: TokenType }>
> = {
  I: [{ label: 'Infinity', tokenType: TokenType.ttNumber }],
  n: [
    { label: 'null', tokenType: TokenType.ttNull },
  ],
  N: [
    { label: 'NaN', tokenType: TokenType.ttNaN },
  ],
  t: [{ label: 'true', tokenType: TokenType.ttBool }],
  f: [{ label: 'false', tokenType: TokenType.ttBool }],
};


type TokenErrorEvent = (errorId: number, errorStr: string) => void;

function createToken(
  token: string,
  tokenType: TokenType,
  index: number = 0,
  column: number = 0,
  line: number = 0,
  length: number = token.length,
  quoteChar: string = ''
) {
  return {
    token,
    tokenType,
    index,
    column,
    line,
    length,
    quoteChar,
  };
}

class Tokenizer {

  public items: Array<Token> = [];

  public onTokenError: TokenErrorEvent|null = null;

  public lastError: string = '';

  public value: string = '';

  private len: number = 0;

  get length() {
    return this.items.length;
  }

  getLast(lastIndex: number = 0) {
    let result: TokenType;
    const index = this.items.length - 1 - lastIndex;
    if (index > -1 && index < this.items.length) result = this.items[index].tokenType;
    else result = TokenType.ttNone;
    return result;
  }

  // getName(index: number) {
  //   let tokenType = this.items[index].tokenType;
  //   return tokenType.toString();
  // }

  // getNames() {
  //   return this.items.map(item => item.tokenType.toString()).join('/n');
  // }

  push(item: Token) {
    this.items.push(item);
  }

  changeLast(
    tokenType: TokenType,
    index: number = 0,
    // newToken?: string
  ) {
    if (!this.length || index >= this.length) return;
    const item =  this.items[this.length - 1 - index];
    item.tokenType = tokenType;
    // if (newToken !== undefined) {
    //   item.token = newToken;
    //   item.length = newToken.length;
    // }
  }

  clear() {
    this.lastError = '';
    this.items.splice(0, this.items.length);
  }

  addOperator(
    token: string,
    tokenType: TokenType,
    index: number,
    column: number,
    line: number,
    length: number,
    quoteChar: string = ''
  ) {
    this.push(createToken(token, tokenType, index, column, line, length, quoteChar));
    return token.length;
  }

  doTokenError(errorId: number, errorStr: string) {
    this.lastError = errorStr;
    if (this.onTokenError) this.onTokenError(errorId, errorStr);
  }

  doNumber(i: number, column: number, line: number): number {
    let dot = false;
    let e = false;
    const len = this.len;
    const value = this.value;
    let newIndex = i;

    if (value[newIndex] === '-') newIndex++;


    while (newIndex < len) {
      const char = value[newIndex];
      if (/[0-9]/.test(char)) {
        newIndex++;
        continue;
      }
      if (NAME_SEPARATOR.includes(char)) {
        break;
      }

      if (char === 'e') {
        if (e || dot) {
          this.doTokenError(ERR_ILLEGAL_NUMBER, `Illegal number: invalid char "${char}"`);
          break;
        }
        e = true;
        newIndex++;
        dot = false;
        if (['-', '+'].includes(value[newIndex])) {
          newIndex++;
        }
        continue;
      }
      if (char === DecimalSeparator) {
        if (dot) {
          this.doTokenError(ERR_ILLEGAL_NUMBER, `Illegal number: already exist decimal separator "${char}"`);
          break;
        }
        dot = true;
        newIndex++;
        continue;
      }
      // if (char === ListSeparator) {
      //   break;
      // }
      this.doTokenError(ERR_ILLEGAL_NUMBER, `Illegal number: unknown char "${char}"`);
      break;
    }
    if (!this.lastError) {
      const length = newIndex - i;
      this.addOperator(
        value.substr(i, length),
        TokenType.ttNumber,
        i,
        column,
        line,
        length
      );
    }

    return newIndex;
  }


  doQuoted(
    i: number,
    column: number,
    line: number,
    quoteChar: string,
    tokenType: TokenType,
    errorCode: number
  ): [index: number, column: number, line: number] {
    let newIndex = i + 1;
    let newColumn = column;
    let newLine = line;
    const len = this.len;
    const value = this.value;
    let quoted = false;
    let j = newIndex;
    let token = '';
    while (newIndex < len) {
      const char = value[newIndex];
      if (char === quoteChar) {
        if (value[newIndex - 1] === EscapeChar) {
          token += value.substr(j, newIndex - 1 - j);
          j = newIndex;
        } else {
          quoted = true;
          break;
        }
      }
      if (char === '\n') {
        newLine += 1;
        newColumn = 1;
      } else if (char !== '\r') {
        newColumn += 1;
      }
      newIndex++;
    }
    if (j < newIndex) {
      token += value.substr(j, newIndex - j);
    }
    if (!quoted) {
      this.doTokenError(errorCode, `missing end quote char ${quoteChar}: ${value.substr(i, newIndex - i)}`);
      return [i, newColumn, newLine];
    }
    newIndex++;
    const length = newIndex - i;
    this.addOperator(token, tokenType, i, column, line, length, quoteChar);
    return [newIndex, newColumn, newLine];
  }

  doString(i: number, column: number, line: number) {
    return this.doQuoted(i, column, line, StringQuoteChar, TokenType.ttString, ERR_STR_MISSING_Q);
  }

  doQuotedName(i: number, column: number, line: number) {
    return this.doQuoted(i, column, line, NameQuoteChar, TokenType.ttName, ERR_QUOTED_NAME_MISSING_Q);
  }

  doRef(i: number, column: number, line: number): number {
    const len = this.len;
    const value = this.value;

    let newIndex = i + 1;
    const j = newIndex;
    while ((newIndex < len) && /[0-9]/.test(value[newIndex])) {
      newIndex++;
    }
    if (j === newIndex) {
      this.doTokenError(ERR_INVALID_REF, `Illegal ref char: invalid char "${value[newIndex]}"`);
      return i;
    }

    const length = newIndex - i;
    this.addOperator(
      value.substr(i, newIndex - i),
      TokenType.ttRef,
      i,
      column,
      line,
      length
    );
    return newIndex;
  }

  doName(i: number, column: number, line: number): number {
    let newIndex = i;
    const len = this.len;
    const value = this.value;

    while ((newIndex < len)) {
      const char = value[newIndex];
      if (NAME_SEPARATOR.includes(char)) {
        if (char !== '?' || value[newIndex + 1] !== '.') {
          break;
        }
      }
      newIndex++;
    }

    const length = newIndex - i;
    this.addOperator(
      value.substr(i, newIndex - i),
      TokenType.ttName,
      i,
      column,
      line,
      length
    );
    return newIndex;
  }

  tokenize(value: string) {
    this.clear();
    this.value = value;
    const len = this.len = value.length;
    let hasSpace = false;

    let index = 0;
    let line = 1;
    let column = 1;

    while ((index < len) && !this.lastError) {
      let prevIndex: number|null = index;
      const char = value[index];
      if (['\t', ' '].includes(char)) {
        hasSpace = true;
        index += this.addOperator(char, TokenType.ttSpace, index, column, line, char.length);
      } else if (char === '\n') {
        if ((index < len) && (value[index + 1] === '\r')) {
          index += this.addOperator('\n\r', TokenType.ttLine, index, column, line, 2);
        } else {
          index += this.addOperator('\n', TokenType.ttLine, index, column, line, 1);
        }
        line += 1;
        column = 1;
        prevIndex = null;
      } else if (/[0-9]/.test(char)) {
        const lastTokenType = this.getLast();
        if ((lastTokenType === TokenType.ttMinus) && TokenNegatives.includes(this.getLast(1))) {
          this.items.pop();
          index = this.doNumber(index - 1, column, line);
        } else {
          index = this.doNumber(index, column, line);
        }
      } else if (char === '+') {
        index += this.addOperator(char, TokenType.ttAdd, index, column, line, char.length);
      } else if (char === '&') {
        const doubleOperator = value[index + 1] === char;
        index += this.addOperator(
          doubleOperator ? '&&' : char,
          TokenType.ttAnd,
          index,
          column,
          line,
          doubleOperator ? 2 : char.length
        );
      } else if (char === '|') {
        const doubleOperator = value[index + 1] === char;
        index += this.addOperator(
          doubleOperator ? '||' : char,
          TokenType.ttOr,
          index,
          column,
          line,
          doubleOperator ? 2 : char.length
        );
      } else if (char === '-') {
        index += this.addOperator(
          char,
          TokenType.ttMinus,
          index,
          column,
          line,
          char.length
        );
      } else if (char === '*') {
        index += this.addOperator(
          char,
          TokenType.ttMul,
          index,
          column,
          line,
          char.length
        );
      } else if (char === '/') {
        if (value[index + 1] === '/') {
          index += this.addOperator('//', TokenType.ttDivInt, index, column, line, 2);
        } else {
          index += this.addOperator(char, TokenType.ttDiv, index, column, line, char.length);
        }
      } else if (char === '%') {
        index += this.addOperator(char, TokenType.ttPercent, index, column, line, char.length);
      } else if (char === '^') {
        index += this.addOperator(char, TokenType.ttPow,  index, column, line, char.length);
      } else if (char === '>') {
        if ((index < len) && (value[index + 1] === '=')) {
          index += this.addOperator('>=', TokenType.ttGE, index, column, line, 2);
        } else {
          index += this.addOperator('>', TokenType.ttGT, index, column, line, 1);
        }
      } else if (char === '<') {
        if ((index < len) && (value[index + 1] === '=')) {
          index += this.addOperator('<=', TokenType.ttLE, index, column, line, 2);
        } else if ((index < len) && (value[index + 1] === '>')) {
          index += this.addOperator('<>', TokenType.ttNE, index, column, line, 2);
        } else {
          index += this.addOperator('<', TokenType.ttLT, index, column, line, 1);
        }
      } else if (char === '!') {
        if ((index < len) && (value[index + 1] === '=')) {
          index += this.addOperator('!=', TokenType.ttNE, index, column, line, 2);
        } else {
          index += this.addOperator('!', TokenType.ttNot, index, column, line, 1);
        }
      } else if (char === '=') {
        if ((index < len) && (value[index + 1] === '=')) {
          index += this.addOperator('==', TokenType.ttEQ, index, column, line, 2);
        } else {
          index += this.addOperator('=', TokenType.ttEQ, index, column, line, 1);
        }
      } else if (char === '?') {
        index += this.addOperator('?', TokenType.ttIf, index, column, line, 1);
      } else if (char === ':') {
        index += this.addOperator(':', TokenType.ttIfElse, index, column, line, 1);
      } else if (char === '(') {
        if (this.getLast() === TokenType.ttName) {
          this.changeLast(TokenType.ttFunc);
        }
        index += this.addOperator(char, TokenType.ttParenL, index, column, line, char.length);
      } else if (char === ')') {
        index += this.addOperator(char, TokenType.ttParenR, index, column, line, char.length);
      } else if (char === StringQuoteChar) {
        [index, column, line] = this.doString(index, column, line);
        prevIndex = null;
      } else if (char === NameQuoteChar) {
        [index, column, line] = this.doQuotedName(index, column, line);
        prevIndex = null;
      } else if (char === '$') {
        index = this.doRef(index, column, line);
      } else if (/[_a-zA-z]/.test(char)) {
        const itemList = LITERAL_MAP[char];
        if (itemList?.some((item) => {
          if (index + item.label.length - 1 < len) {
            const literalValue = value.substr(index, item.label.length);
            const literalValueNextChar = value[index + item.label.length];
            if (literalValue === item.label && (!literalValueNextChar || !REGX_NAME_CHAR.test(literalValueNextChar))) {
              const length = this.addOperator(literalValue, item.tokenType, index, column, line, literalValue.length);
              index += length;
              column += length;
              return true;
            }
          }
        })) {
          continue;
        }

        index = this.doName(index, column, line);
      } else {
        if (char === ListSeparator) {
          this.addOperator(char, TokenType.ttListSeparator, index, column, line, char.length);
          index++;
        } else {
          this.doTokenError(ERR_ILLEGAL_CHAR, `Invalid Token char: "${char}"`);
        }
      }
      if (prevIndex !== null) {
        column += index - prevIndex;
      }
    }

    if (hasSpace) {
      this.items = this.items.filter((v) => ![TokenType.ttSpace, TokenType.ttLine].includes(v.tokenType));
    }

    this.items.forEach((item, i) => {
      if (item.tokenType !== TokenType.ttPercent || i === this.items.length - 1) return;
      const nextItem = this.items[i + 1];
      if (!TokenPercents.includes(nextItem.tokenType)) {
        item.tokenType = TokenType.ttMod;
      }
    });
  }

}


export {
  StringQuoteChar,
  NameQuoteChar,
  createToken
};


export default Tokenizer;
