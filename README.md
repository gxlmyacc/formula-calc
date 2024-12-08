# formula-calc

formula-calc is a library for formula calculation through strings for javascript/typescript.


[![NPM version](https://img.shields.io/npm/v/formula-calc.svg?style=flat)](https://npmjs.com/package/formula-calc)
[![NPM downloads](https://img.shields.io/npm/dm/formula-calc.svg?style=flat)](https://npmjs.com/package/formula-calc)
[![Coverage Status](https://coveralls.io/repos/github/gxlmyacc/formula-calc/badge.svg?branch=main)](https://coveralls.io/github/gxlmyacc/formula-calc?branch=main)

Note: The internal numerical calculation uses the [decimal.js](https://mikemcl.github.io/decimal.js/) library.


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


// calculate with power
const result = formulaCalc('5 ^ 2');
console.log(result); // 25

// calculate with percent
const result = formulaCalc('2% + 1')
console.log(result); // 1.02

// divide to integer
const result = formulaCalc('5 // 4');
console.log(result); // 1
const result = formulaCalc(' -1.1 // 6');
console.log(result); // 0

// calculate with mod
const result = formulaCalc('5 % 2')
console.log(result); // 1

// with parenthesis
const result = formulaCalc('4 * (1 + 1) + 2')
console.log(result); // 10

```

2. with variable

```js
import formulaCalc, { createFormula } from 'formula-calc';

// get param from object
const result = formulaCalc('a + b.c', { 
  params: { 
    a: 1, 
    b: {
      c: 2
    }
  }
 });
console.log(result); // 3

// get param from array
const result = formulaCalc('a + b.c.1', { 
  params: { 
    a: 1, 
    b: {
      c: [1, 2, 3]
    }
  }
 });
console.log(result); // 3

// optional parameter
const result = formulaCalc('a.b?.c', { 
  params: { 
    a: {
      b: 1
    }, 
  }
 });
console.log(result); // 1

// optional parameter in ternary operator
const result = formulaCalc('a.b?.c ? 1 : 2', { 
  params: { 
    a: {
      b: {}
    }, 
  }
 });
console.log(result); // 2


// calc with params list
const result = formulaCalc('a + 1', { 
  params: [
    { a: 1 },
    { a: 2 },
    { a: 3 },
  ]
 });
console.log(result); // [2, 3, 4]

// calc with formula instance
const formula = createFormula('a + 1');
const result = formulaCalc(formula, {
  params: {
    a: 1
  }
});
console.log(result); // 2

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

const result = formulaCalc('sum(1, 2, 3, 4, a)', {
  params: {
    a: [5, 6, 7, 8]
  }
});
console.log(result); // 36

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

const result = formulaCalc('a ? 1 : 2', {
  params: {
    a: true
  }
});
console.log(result); // 1

const result = formulaCalc('a ? 1 : 2', {
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

4. with ref: like regex, $1...$n will match the ordinal of parentheses that do not contain functions

```js

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

5. with custom function 

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

6. with eval

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

7. handle precision

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('10 / 3');
console.log(result); // 3.3333333333333

const result = formulaCalc('10 / 3', { precision: 2 });
console.log(result); // 3.33

```

8. rounding at each step of the operation

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('3.334 + 3.335', {
  stepPrecision: true,
});
console.log(result); // 6.67

const result = formulaCalc('3.3334 + 3.3315', {
  precision: 2,
  stepPrecision: 3,
};
console.log(result); // 6.67

```

9. cast value

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('string(1)');
console.log(result); // '1'

const result = formulaCalc('string(a)', { params: { a: undefined } });
console.log(result); // ''

const result = formulaCalc('number("1")');
console.log(result); // 1

const result = formulaCalc('boolean(1)');
console.log(result); // true

const result = formulaCalc('boolean(0)');
console.log(result); // false

```

10. null as zero

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('a.b.c', {
  params: {
    a: {}
  },
  nullAsZero: true
});
console.log(result); // 0

// empty string as zero
const result = formulaCalc('1 + a.b', {
  params: {
    a: {
      b: ''
    }
  },
  nullAsZero: true
});
console.log(result); // 1

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
  stepPrecision?: boolean|number,
  nullAsZero?: boolean,
  nullIfParamNotFound?: boolean,
  cache?: boolean,
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

- `string` - string, it is quoted with `"`, like "1", "2", "3"

- `boolean` - boolean, like true, false

- `null` - null, `undefined` also be as `null`. `null` will be converted to `0` when `nullAsZero` is `true`.

- `NaN` - NaN

- `Infinity` - Infinity

- `params` - params, like `a`, `a.b`, `a.b.0`, "params" is taken from the "params" parameter in the second parameter of the `formulaCalc` method. If the `param` name contains special characters, it can be quoted with `'`, like this: `'a()*_(&_&*)b'`

- `ref` - `$1`...`$99`, similar to regular expressions, it will match the ordinal of parentheses that do not contain functions

## Operators

Supports the following operators

- `+`  -  add

- `-`  -  subtract

- `*`  -  multiply

- `/`  -  divide

- `//`  -  divide to integer, like `6 // 3` is `2`, `5 // 4` is `1`, if `a` is negative, the result will be `0`, like `-1.1 // 6` is `0`

- `^`  -  power

- `%`  -  mod

- `=`  -  equal, like `a = b`, if `a` or `b` is `undefined`, it will be as `null`

- `!=`  -  not equal

- `>`  -  greater than

- `>=`  -  greater than or equal to

- `<`  -  less than

- `<=`  -  less than or equal to

- `&` or `&&`  -  and

- `|` or `||`  -  or

- `!`  -  not

- `? :`  -  ternary operator, like `a ? b : c`

- `()` -  parenthesis

## Functions

Supports the following built in functions:

### Basic Functions
- `abs(x)` - Returns the absolute value of x

- `ceil(x)` - Rounds x up to the nearest integer

- `floor(x)` - Rounds x down to the nearest integer

- `round(x, y?)` - Rounds x to y decimal places (defaults to `2`)

- `trunc(x)` - Removes decimal places from x without rounding

- `sign(x)` - Returns the sign of x (-1, 0, or 1)

- `clamp(x, min, max)` - Restricts x to be between min and max values

### Exponential and Logarithmic Functions

- `sqrt(x)` - Returns the square root of x

- `cbrt(x)` - Returns the cube root of x

- `ln(x)` - Returns the natural logarithm (base e) of x

- `log(x)` - Returns the natural logarithm (base e) of x (alias of ln)

- `log10(x)` - Returns the base-10 logarithm of x

- `log2(x)` - Returns the base-2 logarithm of x

### Trigonometric Functions

- `sin(x)` - Returns the sine of x (x in radians)

- `cos(x)` - Returns the cosine of x (x in radians)

- `tan(x)` - Returns the tangent of x (x in radians)

- `asin(x)` - Returns the arcsine of x in radians
- `acos(x)` - Returns the arccosine of x in radians
- `atan(x)` - Returns the arctangent of x in radians
- `atan2(y, x)` - Returns the arctangent of the quotient of y and x in radians

### Hyperbolic Functions

- `sinh(x)` - Returns the hyperbolic sine of x

- `cosh(x)` - Returns the hyperbolic cosine of x

- `tanh(x)` - Returns the hyperbolic tangent of x

- `asinh(x)` - Returns the inverse hyperbolic sine of x

- `acosh(x)` - Returns the inverse hyperbolic cosine of x

- `atanh(x)` - Returns the inverse hyperbolic tangent of x

### Special Functions

- `eval(expr)` - evaluate expression

- `exist(o, key, type?)` - check if the key exists in the object, if type is not specified, it will be checked for all types, if type is specified, it will be checked for the specified type.

- `if(a, b, c?)` - if `a` is true, then return `b`, otherwise return `c`

- `noref(x)` - directly return x, because `ref` does not count the parentheses of a function, the parentheses wrapped in `noref` will not be included in the `ref`.

- `max(n1, n2, ..., n99)` - maximum, note : `nX` can be number array.

- `min(n1, n2, ..., n99)` - minimum, note : `nX` can be number array.

- `sum(n1, n2, ..., n99)` - sum, note : `nX` can be number array.

- `avg(n1, n2, ..., n99)` - average, note : `nX` can be number array.

- `random(n)` - random number

- `hypot(x1, x2, ..., xn)` - Returns the square root of the sum of squares of its arguments

### Cast Functions

- `string(expr)` - cast expr to string, note: if `expr` is `undefined`, it will be as `null`

- `number(expr)` - cast expr to number

- `boolean(expr)` - cast expr to boolean

## Custom Functions

Custom functions can be used to extend the formula language. due to the formula supporting promise calculation, you can even provide UI related interactions in custom methods

```js
import formulaCalc from 'formula-calc';

const result = await formulaCalc('confirm("some prompt", 1, 2) + 1', {
  customFunctions: {
    confirm: {
      argMin: 3,
      argMax: 3,
      execute([prompt, a, b]) {
        return new Promise((resolve) => {
          // some UI interaction
          setTimeout(() => {
            resolve(a > b ? a : b);
          }, 1000);
        });
      }
    }
  }
});
```


## License

[MIT](./LICENSE)

