# formula-calc

formula-calc is a library for formula calculation through strings for javascript/typescript.


[![NPM version](https://img.shields.io/npm/v/formula-calc.svg?style=flat)](https://npmjs.com/package/formula-calc)
[![NPM downloads](https://img.shields.io/npm/dm/formula-calc.svg?style=flat)](https://npmjs.com/package/formula-calc)
[![Coveralls](https://img.shields.io/coveralls/gxlmyacc/formula-calc.svg)](https://coveralls.io/github/gxlmyacc/formula-calc)


## Install

```bash
npm install --save formula-calc
```
or
```bash
yarn add formula-calc
```

## Usage

1. basic

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('1 + 1');
console.log(result); // 2
const result = formulaCalc('1 - 1');
console.log(result); // 0
const result = formulaCalc('2 * 3');
console.log(result); // 6
const result = formulaCalc('4 / 2');
console.log(result); // 2
const result = formulaCalc('5 ^ 2');
console.log(result); // 25
const result = formulaCalc('5 % 2')
console.log(result); // 1
const result = formulaCalc('2% + 1')
console.log(result); // 1.02

// with parenthesis
const result = formulaCalc('4 * (1 + 1) + 2')
console.log(result); // 10

```

2. with variable

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('a + b.c', { 
  params: { 
    a: 1, 
    b: {
      c: 2
    }
  }
 });
console.log(result); // 3

const result = formulaCalc('a + b.c.1', { 
  params: { 
    a: 1, 
    b: {
      c: [1, 2, 3]
    }
  }
 });
console.log(result); // 3

// with promise
const result = await formulaCalc('a + 1', { 
  params: { 
    a: Promise.resolve(2),
  }
 });
console.log(result); // 3

```

3. with function, built in functions: add, avg, ceil, eval, exist, floor, if, max, min, noref, random, round, sqrt, sum, trunc

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('max(1, 2, 3, 4, 5)');
console.log(result); // 5

const result = formulaCalc('min(1, 2, 3, 4, 5)');
console.log(result); // 1

const result = formulaCalc('abs(-1)');
console.log(result); // 1

const result = formulaCalc('sum(1, 2, 3, 4, 5)');
console.log(result); // 15

const result = formulaCalc('round(2.335)');
console.log(result); // 2.34

const result = formulaCalc('round(2.335, 1)');
console.log(result); // 2.3

const result = formulaCalc('if(a, 1, 2)', {
  params: {
    a: true
  }
});
console.log(result); // 1

const result = formulaCalc('if(a, 1, 2)', {
  params: {
    a: false
  }
});
console.log(result); // 2

// with ref: like regex, $1...$n will match the ordinal of parentheses that do not contain functions
const result = formulaCalc(
`if(
  (a + 2) > 0, 
  $1, 
  0 - $1
)`, {
  params: {
    a: -3
  }
});
console.log(result); // 1

```

4. with custom function 

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('add1(2.11)', {
  customFunctions: {
    add1: {
      argMin: 1,
      argMax: 1,
      execute(params) {
        return params[0] + 1;
      }
    }
  }
});
console.log(result); // 3.11

```

5. with eval

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc(
`if(
  a > 0, 
  eval(planA), 
  eval(planB)
)`, {
  params: {
    a: -3,
    planA: 'a + 1',
    planB: '0 - a + 1',
  }
});
console.log(result); // 4

```

6. handle precision

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('10 / 3');
console.log(result); // 3.3333333333333

const result = formulaCalc('10 / 3', { precision: 2 });
console.log(result); // 3.33

```

7. rounding at each step of the operation

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('3.334 + 3.335', {
  stepRrounding: true,
});
console.log(result); // 6.67

const result = formulaCalc('3.3334 + 3.3315', {
  precision: 2,
  stepRrounding: 3,
};
console.log(result); // 6.67

```

## Documentation

### API

- formulaCalc

```ts
type RoundingType = 'UP'|'DOWN'|'CEIL'|'FLOOR'|'HALF_UP'|'HALF_DOWN'|'HALF_EVEN'|'HALF_CEIL'|'HALF_FLOOR'|'EUCLID';

type FormulaValueOptions = {
  Decimal?: typeof Decimal,
  precision?: number,
  rounding?: RoundingType,
  stepRrounding?: boolean|number,
  eval?: null|((expr: string, dataSource: IFormulaDataSource, options:  FormulaValueOptions) => any),
}

interface FormulaOptions extends FormulaValueOptions {

}

interface FormulaCalcOptions extends FormulaOptions {
  params?: Record<string, any>|((name: string) => any),
  customFunctions?: Record<string, FormulaCustomFunctionItem>,
  dataSource?: IFormulaDataSource,
}

declare function formulaCalc(
  expression: string,
  options: FormulaCalcOptions = {}
): any;
```

## Values

Supports the following values

- `number` - number, like 1, 2, 3, 1e3, 1e+3, 1e-3

- `string` - string, like '1', '2', '3'

- `boolean` - boolean, like true, false

- `null` - null, like null

- `NaN` - NaN

- `Infinity` - Infinity

- `params` - params, like `a`, `a.b`, `a.b.0`, "params" is taken from the "params" parameter in the second parameter of the `formulaCalc` method. If the `param` name contains special characters, it can be enclosed with ', like this: `'a()*_(&_&*)b'`.

- `ref` - `$1`...`$99`, similar to regular expressions, it will match the ordinal of parentheses that do not contain functions.

## Operator

Supports the following operators

- `+`  -  add

- `-`  -  subtract

- `*`  -  multiply

- `/`  -  divide

- `^`  -  power

- `%`  -  mod

- `=`  -  equal

- `!=`  -  not equal

- `>`  -  greater than

- `>=`  -  greater than or equal to

- `<`  -  less than

- `<=`  -  less than or equal to

- `&`  -  and

- `|`  -  or

- `!`  -  not

- `()` -  parenthesis

## Functions

Supports the following functions

- `abs(x)` - absolute value

- `avg(x, y, ...)` - average

- `ceil(x)` - ceiling

- `floor(x)` - floor

- `max(x, y, ...)` - maximum

- `min(x, y, ...)` - minimum

- `round(x, y)` - round

- `sqrt(x)` - square root

- `trunc(x)` - truncate

- `random(n)` - random number

- `if(a, b, c)` - if `a` is true, then return `b`, otherwise return `c`

- `noref(x)` - directly return x, because `ref` does not count the parentheses of a function, the parentheses wrapped in `noref` will not be included in the `ref`.

- `exist(o, key, type?)` - check if the key exists in the object, if type is not specified, it will be checked for all types, if type is specified, it will be checked for the specified type.



## Custom Functions

Custom functions can be used to extend the formula language.

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('add1(2.11)', {
  customFunctions: {
    add1: {
      argMin: 1,
      argMax: 1,
      execute(params) {
        return params[0] + 1;
      }
    }
  }
});
console.log(result); // 3.11
```


## License

[MIT](./LICENSE)

