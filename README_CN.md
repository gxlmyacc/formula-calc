# 公式计算库

公式计算库是一个用于通过字符串进行公式计算的 JavaScript/TypeScript 库。

[![NPM 版本](https://img.shields.io/npm/v/formula-calc.svg?style=flat)](https://npmjs.com/package/formula-calc)
[![NPM 下载量](https://img.shields.io/npm/dm/formula-calc.svg?style=flat)](https://npmjs.com/package/formula-calc)
[![覆盖率状态](https://coveralls.io/repos/github/gxlmyacc/formula-calc/badge.svg?branch=main)](https://coveralls.io/github/gxlmyacc/formula-calc?branch=main)

注意：内部数值计算使用 [decimal.js](https://mikemcl.github.io/decimal.js/) 库。

## 主要特性

1. 基本计算：支持基本数学运算，如加法、减法、乘法、除法、指数和取模。

2. 变量支持：允许通过对象或数组传递参数，支持可选参数和三元运算。

3. 内置函数：提供多种内置函数，如 max、min、sum、avg、round 等。

4. 自定义函数：用户可以定义自己的函数以扩展库的功能。

5. 异步支持：支持 Promise 计算，允许处理异步参数。

6. 精度控制：用户可以设置计算的精度和每一步的精度。

7. 类型转换：支持将值转换为字符串、数字和布尔值。

8. 空值处理：可以将 `null`、 `undefined`、 `NaN`、空字符串 视为零处理(`nullAsZero`)。

## 安装

```bash
npm install --save formula-calc
```
或
```bash
yarn add formula-calc
```

## 使用

1. 基本用法

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

// 计算幂
const result = formulaCalc('5 ^ 2');
console.log(result); // 25

// 计算百分比
const result = formulaCalc('2% + 1')
console.log(result); // 1.02

// 整除
const result = formulaCalc('5 // 4');
console.log(result); // 1
const result = formulaCalc(' -1.1 // 6');
console.log(result); // 0

// 计算取模
const result = formulaCalc('5 % 2')
console.log(result); // 1

// 使用括号
const result = formulaCalc('4 * (1 + 1) + 2')
console.log(result); // 10
```

2. 使用变量

```js
import formulaCalc, { createFormula } from 'formula-calc';

// 从对象获取参数
const result = formulaCalc('a + b.c', { 
  params: { 
    a: 1, 
    b: {
      c: 2
    }
  }
 });
console.log(result); // 3

// 从数组获取参数
const result = formulaCalc('a + b.c.1', { 
  params: { 
    a: 1, 
    b: {
      c: [1, 2, 3]
    }
  }
 });
console.log(result); // 3

// 可选参数
const result = formulaCalc('a.b?.c', { 
  params: { 
    a: {
      b: 1
    }, 
  }
 });
console.log(result); // 1

// 三元运算中的可选参数
const result = formulaCalc('a.b?.c ? 1 : 2', { 
  params: { 
    a: {
      b: {}
    }, 
  }
 });
console.log(result); // 2

// 使用参数列表计算
const result = formulaCalc('a + 1', { 
  params: [
    { a: 1 },
    { a: 2 },
    { a: 3 },
  ]
 });
console.log(result); // [2, 3, 4]

// 使用公式实例计算
const formula = createFormula('a + 1');
const result = formulaCalc(formula, {
  params: {
    a: 1
  }
});
console.log(result); // 2

// 使用 Promise
const result = await formulaCalc('a + 1', { 
  params: { 
    a: Promise.resolve(2),
  }
 });
console.log(result); // 3
```

3. 使用函数，内置函数：add、avg、ceil、eval、exist、floor、if、max、min、noref、random、round、sqrt、sum

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

// 使用引用：类似正则表达式，$1...$n 将匹配不包含函数的括号的序号
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

4. 使用引用：类似正则表达式，$1...$n 将匹配不包含函数的括号的序号

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

5. 使用自定义函数 

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

6. 使用 eval

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

7. 处理精度

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('10 / 3');
console.log(result); // 3.3333333333333

const result = formulaCalc('10 / 3', { precision: 2 });
console.log(result); // 3.33
```

8. 在每一步操作中进行四舍五入

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('3.334 + 3.335', {
  stepPrecision: true,
});
console.log(result); // 6.67

const result = formulaCalc('3.3334 + 3.3315', {
  precision: 2,
  stepPrecision: 3,
});
console.log(result); // 6.67
```

9. 值的类型转换

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

10. 将 null 视为零

```js
import formulaCalc from 'formula-calc';

const result = formulaCalc('a.b.c', {
  params: {
    a: {}
  },
  nullAsZero: true
});
console.log(result); // 0

// 空字符串视为零
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

## 文档

### API

- formulaCalc

```ts
type RoundingType = 'UP'|'DOWN'|'CEIL'|'FLOOR'|'HALF_UP'|'HALF_DOWN'|'HALF_EVEN'|'HALF_CEIL'|'HALF_FLOOR'|'EUCLID';

type FormulaValueOptions = {
  Decimal?: typeof Decimal,
  precision?: number,
  rounding?: RoundingType,
  stepPrecision?: boolean|number,
  tryStringToNumber?: boolean,
  returnDecimal?: boolean,
  nullAsZero?: boolean,
  nullIfParamNotFound?: boolean,
  eval?: null|((expr: string, dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any),
}

interface FormulaOptions extends FormulaValueOptions {

}

interface FormulaCreateOptions extends FormulaOptions {
  customFunctions?: Record<string, FormulaCustomFunctionItem>,
}

interface FormulaCalcCommonOptions extends FormulaCreateOptions {
  dataSource?: IFormulaDataSource
}

interface FormulaCalcOptions extends FormulaOptions {
  params?: FormulaCalcParams|Array<FormulaCalcParams>,
  onFormulaCreated?: (formula: Formula) => void,
  cache?: boolean,
}

function formulaCalc<T extends any = any>(
  expressionOrFormula: string|Formula,
  options: FormulaCalcOptions = {},
  returnReferenceType?: T|((result: any) => T)
): T;
```

#### expressionOrFormula

支持以下类型：

- 表达式字符串，如：`a + b`。

- 公式实例。可以通过`new Formula()`来创建，若需要对相同表达式进行大量重复计算，建议使用公式实例，因为公式实例会缓存计算结果，从而提高性能。

使用formula实例:
```ts
import formulaCalc from 'formula-calc';

const formula = new Formula();
formula.parse('1 + a');

const result = [1, 2, 3].map(a => formulaCalc(formula, { params: { a } }));
console.log(result); // [2, 3, 4]

```

你也可以使用参数列表实现相同相同的功能:
```ts
import formulaCalc from 'formula-calc';

const result = formulaCalc('1 + a', { params: [1, 2, 3].map(a => ({ a }))  });
console.log(result); // [2, 3, 4]
```

#### options

以下是 `formulaCalc` 中 `options` 支持的参数的表格式说明文档：

| 参数名称 | 类型 | 默认值 | 描述 |
|------------------------------|----------------------------------------|--------------|--------------------------------------------------------------|
| params  | FormulaCalcParams\| Array\<FormulaCalcParams\> | - | 传递给表达式的参数，可以是对象或数组。若为数组，则会将数组中每个对象作为参数遍历执行表达式，并返回一个结果数组。 |
| dataSource | IFormulaDataSource | - | 传递给表达式的自定义数据源，如果不传递，则使用默认的数据源（处理params参数的获取）。若传递，则params参数的获取将由使用者自己处理。 |
| customFunctions | Record\<string, FormulaCustomFunctionItem\> | - | 自定义函数映射表，用于注册自定义函数。 |
| onFormulaCreated | (formula: Formula) => void | - | 创建公式实例后执行的回调函数。 |
| cache | boolean | false | 是否缓存公式实例，默认为 false。若为 true，则相同表达式的函数实例将被缓存，下次相同表达式调用时，将直接返回缓存的实例，而不会重新创建。 |
| Decimal | typeof Decimal | - | 用于数值计算的 Decimal.js 自定义实例。 |
| precision | number | 2 | 设置计算结果的精度。 |
| rounding | RoundingType | 'HALF_UP' | 设置舍入类型。可选值包括：UP、DOWN、CEIL、FLOOR、HALF_UP、HALF_DOWN、HALF_EVEN、HALF_CEIL、HALF_FLOOR、EUCLID。 |
| stepPrecision | boolean \| number | - | 是否在每一步操作中进行四舍五入，或设置每一步的精度。 |
| tryStringToNumber | boolean | false | 是否尝试将字符串转换为数字。 |
| returnDecimal | boolean | false | 是否将返回的数字类型作为 Decimal 类型进行返回。 |
| nullAsZero | boolean | false | 是否将 `null`、`undefined`、`NaN` 、`空字符串` 视为零参与计算。 |
| nullIfParamNotFound | boolean | false | 如果参数未找到，是否返回 `null`。若为false时，未找到参数将抛出异常。 |
| eval | null | ((expr: string, dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any) | - | 自定义的表达式eval函数。 |

#### returnReferenceType

`formulaCalc`的返回值类型参考参数。在`js`代码中，使用者可以通过预判的返回值类型设置`returnReferenceType`为对应的类型，以方便ide实现类型提示。

像这样：

```js
/** ide应该可以自动识别到result为number类型  */
const result = formulaCalc('1 + 1', {}, 0);
```

若`returnReferenceType`为函数，则可以在`formulaCalc`返回之前对结果值做一些处理，而该函数返回值将作为最终返回值。

## 值

支持以下值

- `number` - 数字，如 1、2、3、1e3、1e+3、1e-3

- `string` - 字符串，用 `"` 引起来，如 "1"、"2"、"3"

- `boolean` - 布尔值，如 true、false

- `null` - null，`undefined` 也视为 `null`。当 `nullAsZero` 为 true 时，`null` 将被转换为 `0`。

- `NaN` - NaN

- `Infinity` - Infinity

- `params` - 参数，如 `a`、`a.b`、`a.b.0`，`params` 从 `formulaCalc` 方法的第二个参数中的 `params` 参数中获取。如果参数名称包含特殊字符，可以用 `'` 引起来，如 `'a()*_(&_&*)b'`

- `ref` - `$1`...`$99`，类似于正则表达式，将匹配不包含函数的括号的序号

## 运算符

支持以下运算符

- `+`  -  加法

- `-`  -  减法

- `*`  -  乘法

- `/`  -  除法

- `//`  -  整除，如 `6 // 3` 为 `2`，`5 // 4` 为 `1`，如果 `a` 为负数，结果将为 `0`，如 `-1.1 // 6` 为 `0`

- `^`  -  幂

- `%`  -  取模

- `=`  -  等于，如 `a = b`，如果 `a` 或 `b` 为 `undefined`，将视为 `null`

- `!=` 或 `<>`  -  不等于

- `>`  -  大于

- `>=`  -  大于或等于

- `<`  -  小于

- `<=`  -  小于或等于

- `&` 或 `&&`  -  与

- `|` 或 `||`  -  或

- `!`  -  非

- `? :`  -  三元运算符，如 `a ? b : c`

- `()` -  括号

注意：上述操作符中的比较操作符（`=`, `!=`, `<>`, `>`, `<`, `>=`, `<=`）在进行比较之前，如果比较的两边中有一边是数字，则将会尝试将两边都转换为数字进行比较，否则进行字符串比较，比如`10 > "2"`为true，而`"10" > "2"`为false。如果配置了`tryStringToNumber`为`true`，则将会尝试将两边的字符串转换为数字进行比较。

## 函数

支持以下内置函数：

### 基本函数
- `abs(x)` - 返回 x 的绝对值

- `ceil(x)` - 将 x 向上舍入到最接近的整数

- `floor(x)` - 将 x 向下舍入到最接近的整数

- `round(x, y?)` - 将 x 舍入到 y 位小数（默认为 `2`）

- `trunc(x)` - 从 x 中去掉小数位而不进行舍入

- `sign(x)` - 返回 x 的符号 (-1、0 或 1)

- `clamp(x, min, max)` - 将 x 限制在 min 和 max 值之间

### 指数和对数函数

- `sqrt(x)` - 返回 x 的平方根

- `cbrt(x)` - 返回 x 的立方根

- `ln(x)` - 返回 x 的自然对数（以 e 为底）

- `log(x)` - 返回 x 的自然对数（以 e 为底）（ln 的别名）

- `log10(x)` - 返回 x 的以 10 为底的对数

- `log2(x)` - 返回 x 的以 2 为底的对数

### 三角函数

- `sin(x)` - 返回 x 的正弦（x 以弧度为单位）

- `cos(x)` - 返回 x 的余弦（x 以弧度为单位）

- `tan(x)` - 返回 x 的正切（x 以弧度为单位）

- `asin(x)` - 返回 x 的反正弦（以弧度为单位）

- `acos(x)` - 返回 x 的反余弦（以弧度为单位）

- `atan(x)` - 返回 x 的反正切（以弧度为单位）

- `atan2(y, x)` - 返回 y 和 x 的商的反正切（以弧度为单位）

### 双曲函数

- `sinh(x)` - 返回 x 的双曲正弦

- `cosh(x)` - 返回 x 的双曲余弦

- `tanh(x)` - 返回 x 的双曲正切

- `asinh(x)` - 返回 x 的反双曲正弦

- `acosh(x)` - 返回 x 的反双曲余弦

- `atanh(x)` - 返回 x 的反双曲正切

### 字符串函数

- `concat(n1, n2, ..., n99)` - 将所有参数返回为一个字符串

### 特殊函数

- `eval(expr)` - 评估表达式

- `exist(o, key, type?)` - 检查对象中是否存在键，如果未指定类型，将检查所有类型，如果指定了类型，将检查指定类型。

- `if(a, b, c?)` - 如果 `a` 为真，则返回 `b`，否则返回 `c`

- `noref(x)` - 直接返回 x，因为 `ref` 不计算函数的括号，包裹在 `noref` 中的括号将不被计入 `ref`。

- `max(n1, n2, ..., n99)` - 最大值，注意：`nX` 可以是数字数组。

- `min(n1, n2, ..., n99)` - 最小值，注意：`nX` 可以是数字数组。

- `sum(n1, n2, ..., n99)` - 求和，注意：`nX` 可以是数字数组。

- `avg(n1, n2, ..., n99)` - 平均值，注意：`nX` 可以是数字数组。

- `random(n)` - 随机数

- `hypot(x1, x2, ..., xn)` - 返回其参数的平方和的平方根

### 类型转换函数

- `string(expr)` - 将 expr 转换为字符串，注意：`null` 将被转换为空字符串，如果 `expr` 为 `undefined`，将视为 `null`

- `number(expr)` - 将 expr 转换为数字

- `boolean(expr)` - 将 expr 转换为布尔值

## 自定义函数

自定义函数可用于扩展公式语言。由于公式支持 Promise 计算，您甚至可以在自定义方法中提供与 UI 相关的交互。

```js
import formulaCalc from 'formula-calc';

const result = await formulaCalc('confirm("some prompt", 1, 2) + 1', {
  customFunctions: {
    confirm: {
      argMin: 3,
      argMax: 3,
      execute([prompt, a, b]) {
        return new Promise((resolve) => {
          // 一些 UI 交互
          setTimeout(() => {
            resolve(a > b ? a : b);
          }, 1000);
        });
      }
    }
  }
});
```

## 许可证

[MIT](./LICENSE)
