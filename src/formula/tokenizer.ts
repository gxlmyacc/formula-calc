import {
  ERR_ILLEGAL_NUMBER,
  ERR_STR_MISSING_Q,
  ERR_QUOTED_NAME_MISSING_Q,
  ERR_INVALID_REF,
  REGX_NAME_CHAR,
  ERR_ILLEGAL_CHAR,
} from './constant';
import { TokenType, TokenNegatives, TokenPercents } from './type';


const DecimalSeparator = '.';
const ListSeparator = ',';
const EscapeChar = '\\';
interface Token {
  token: string;
  tokenType: TokenType;
  index: number,
  length: number;
}

const SPACE_SEPARATOR = [
  ' ', '\t', '\n', '\r',
];

const NAME_SEPARATOR = [
  ListSeparator, '\\',
  '/', '?', '*', '[',
  ']', '+', '&',
  '-', '*', '/', '%',
  '^', '<', '>', '=',
  '(', ')', '#', '{', '}',
  "'", '"', '!',
  ...SPACE_SEPARATOR
];


type TokenErrorEvent = (errorId: number, errorStr: string) => void;

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
    let item =  this.items[this.length - 1 - index];
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

  addOperator(token: string, tokenType: TokenType, index: number, length: number) {
    this.items.push({ token, tokenType, index, length });
    return token.length;
  }

  doTokenError(errorId: number, errorStr: string) {
    this.lastError = errorStr;
    if (this.onTokenError) this.onTokenError(errorId, errorStr);
  }

  doNumber(i: number) {
    let dot = false;
    let e = false;
    let len = this.len;
    let value = this.value;
    let result = i;

    if (value[result] === '-') result++;


    while (result < len) {
      const char = value[result];
      if (/[0-9]/.test(char)) {
        result++;
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
        result++;
        dot = false;
        if (['-', '+'].includes(value[result])) {
          result++;
        }
        continue;
      }
      if (char === DecimalSeparator) {
        if (dot) {
          this.doTokenError(ERR_ILLEGAL_NUMBER, `Illegal number: already exist decimal separator "${char}"`);
          break;
        }
        dot = true;
        result++;
        continue;
      }
      // if (char === ListSeparator) {
      //   break;
      // }
      this.doTokenError(ERR_ILLEGAL_NUMBER, `Illegal number: unknown char "${char}"`);
      break;
    }
    if (!this.lastError) {
      const length = result - i;
      this.items.push({
        token: value.substr(i, length),
        tokenType: TokenType.ttNumber,
        index: i,
        length
      });
    }

    return result;
  }


  doQuoted(i: number, quoteChar: string, tokenType: TokenType, errorCode: number) {
    let result = i + 1;
    let len = this.len;
    let value = this.value;
    let quoted = false;
    let j = result;
    let token = '';
    while (result < len) {
      if (value[result] === quoteChar) {
        if (value[result - 1] === EscapeChar) {
          token += value.substr(j, result - 1 - j);
          j = result;
        } else {
          quoted = true;
          break;
        }
      }
      result++;
    }
    if (j < result) {
      token += value.substr(j, result - j);
    }
    if (!quoted) {
      this.doTokenError(errorCode, `missing end quote char ${quoteChar}: ${value.substr(i, result - i)}`);
      return i;
    }
    result++;
    const length = result - i;
    this.push({
      token,
      tokenType,
      index: i,
      length
    });
    return result;
  }

  doString(i: number) {
    return this.doQuoted(i, '"', TokenType.ttString, ERR_STR_MISSING_Q);
  }

  doQuotedName(i: number) {
    return this.doQuoted(i, "'", TokenType.ttName, ERR_QUOTED_NAME_MISSING_Q);
  }

  doRef(i: number) {
    let len = this.len;
    let value = this.value;

    let result = i + 1;
    let j = result;
    while ((result < len) && /[0-9]/.test(value[result])) {
      result++;
    }
    if (j === result) {
      this.doTokenError(ERR_INVALID_REF, `Illegal ref char: invalid char "${value[result]}"`);
      return i;
    }

    const length = result - i;
    this.push({
      token: value.substr(i, result - i),
      tokenType: TokenType.ttRef,
      index: i,
      length
    });
    return result;
  }

  doName(i: number) {
    let result = i;
    let len = this.len;
    let value = this.value;

    while ((result < len) && !NAME_SEPARATOR.includes(value[result])) {
      result++;
    }

    const length = result - i;
    this.push({
      token: value.substr(i, result - i),
      tokenType: TokenType.ttName,
      index: i,
      length
    });
    return result;
  }

  tokenize(value: string) {
    this.clear();
    this.value = value;
    let len = this.len = value.length;
    let hasSpace = false;

    let i = 0;

    while ((i < len) && !this.lastError) {
      let char = value[i];
      if (['\t', ' '].includes(char)) {
        hasSpace = true;
        i += this.addOperator(char, TokenType.ttSpace, i, char.length);
      } else if (char === '\n') {
        if ((i < len) && (value[i + 1] === '\r')) {
          i += this.addOperator('\n\r', TokenType.ttLine, i, 2);
        } else {
          i += this.addOperator('\n', TokenType.ttLine, i, 1);
        }
      } else if (/[0-9]/.test(char)) {
        let lastTokenType = this.getLast();
        if ((lastTokenType === TokenType.ttMinus) && TokenNegatives.includes(this.getLast(1))) {
          this.items.pop();
          i = this.doNumber(i - 1);
        } else {
          i = this.doNumber(i);
        }
      } else if (char === '+') {
        i += this.addOperator(char, TokenType.ttAdd, i, char.length);
      } else if (char === '&') {
        i += this.addOperator(char, TokenType.ttAnd, i, char.length);
      } else if (char === '|') {
        i += this.addOperator(char, TokenType.ttOr, i, char.length);
      } else if (char === '-') {
        i += this.addOperator(char, TokenType.ttMinus, i, char.length);
      } else if (char === '*') {
        i += this.addOperator(char, TokenType.ttMul, i, char.length);
      } else if (char === '/') {
        i += this.addOperator(char, TokenType.ttDiv, i, char.length);
      } else if (char === '%') {
        i += this.addOperator(char, TokenType.ttPercent, i, char.length);
      } else if (char === '^') {
        i += this.addOperator(char, TokenType.ttPow,  i, char.length);
      } else if (char === '>') {
        if ((i < len) && (value[i + 1] === '=')) {
          i += this.addOperator('>=', TokenType.ttGE, i, 2);
        } else {
          i += this.addOperator('>', TokenType.ttGT, i, 1);
        }
      } else if (char === '<') {
        if ((i < len) && (value[i + 1] === '=')) {
          i += this.addOperator('<=', TokenType.ttLE, i, 2);
        } else if ((i < len) && (value[i + 1] === '>')) {
          i += this.addOperator('<>', TokenType.ttNE, i, 2);
        } else {
          i += this.addOperator('<', TokenType.ttLT, i, 1);
        }
      } else if (char === '!') {
        if ((i < len) && (value[i + 1] === '=')) {
          i += this.addOperator('!=', TokenType.ttNE, i, 2);
        } else {
          i += this.addOperator('!', TokenType.ttNot, i, 1);
        }
      } else if (char === '=') {
        i += this.addOperator('=', TokenType.ttEQ, i, 1);
      } else if (char === '(') {
        if (this.getLast() === TokenType.ttName) {
          this.changeLast(TokenType.ttFunc);
        }
        i += this.addOperator(char, TokenType.ttParenL, i, char.length);
      } else if (char === ')') {
        i += this.addOperator(char, TokenType.ttParenR, i, char.length);
      } else if (char === '"') {
        i = this.doString(i);
      } else if (char === "'") {
        i = this.doQuotedName(i);
      } else if (char === '$') {
        i = this.doRef(i);
      } else if (/[_a-zA-z]/.test(char)) {
        const literalMap: Record<string, { label: string, tokenType: TokenType }[]> = {
          I: [{ label: 'INFINITY', tokenType: TokenType.ttNumber }],
          N: [
            { label: 'NULL', tokenType: TokenType.ttNull },
            { label: 'NAN', tokenType: TokenType.ttNaN },
          ],
          T: [{ label: 'TRUE', tokenType: TokenType.ttBool }],
          F: [{ label: 'FALSE', tokenType: TokenType.ttBool }],
        };
        let itemList = literalMap[char.toUpperCase()];
        if (itemList?.some(item => {
          if (i + item.label.length - 1 < len) {
            let literalValue = value.substr(i, item.label.length);
            let literalValueNextChar = value[i + item.label.length];
            if (literalValue.toUpperCase() === item.label && (!literalValueNextChar || !REGX_NAME_CHAR.test(literalValueNextChar))) {
              i += this.addOperator(literalValue, item.tokenType, i, literalValue.length);
              return true;
            }
          }
        })) {
          continue;
        }

        i = this.doName(i);
      } else {
        if (char === ListSeparator) {
          this.push({ token: char, tokenType: TokenType.ttListSeparator, index: i, length: char.length });
          i++;
        } else {
          this.doTokenError(ERR_ILLEGAL_CHAR, `Invalid Token char: "${char}"`);
        }
      }
    }

    if (hasSpace) {
      this.items = this.items.filter(v => ![TokenType.ttSpace, TokenType.ttLine].includes(v.tokenType));
    }

    this.items.forEach((item, i) => {
      if (item.tokenType !== TokenType.ttPercent || i === this.items.length - 1) return;
      let nextItem = this.items[i + 1];
      if (!TokenPercents.includes(nextItem.tokenType)) {
        item.tokenType = TokenType.ttMod;
      }
    });
  }

}


export default Tokenizer;
