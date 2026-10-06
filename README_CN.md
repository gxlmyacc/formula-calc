# formula-calc

`formula-calc`是一个用于通过字符串进行公式计算的 JavaScript/TypeScript 库。

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

9. 结果引用：支持类似正则表达式中通过`$1...$n`按顺序引用括弧内的计算结果。

## 在线调试网站

网站支持公式高亮和补全、函数参数提示、括号引用序号及层级颜色、参数表单 / JSON 批量输入、计算配置和逐组执行日志。

在线地址：[https://gxlmyacc.github.io/formula-calc/](https://gxlmyacc.github.io/formula-calc/)

## 安装

```bash
npm install --save formula-calc
```
或
```bash
yarn add formula-calc
```

## 使用

默认入口为兼容 Chrome 49 的 ESM 构建；现代浏览器（Chrome 86+）可以选择 `formula-calc/es`。两个入口使用相同的 TypeScript 类型声明，由项目的打包工具加载。

```js
import formulaCalc from 'formula-calc';
const { default: modernFormulaCalc } = await import('formula-calc/es');
```

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
console.log(result); // 6.66
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

#### formulaCalc

`formulaCalc`是默认的导出方法。它是进行公式计算的核心函数。

```tsx
type RoundingType = 'UP'|'DOWN'|'CEIL'|'FLOOR'|'HALF_UP'|'HALF_DOWN'|'HALF_EVEN'|'HALF_CEIL'|'HALF_FLOOR'|'EUCLID';

type FormulaValueOptions = {
  Decimal?: typeof Decimal,
  precision?: number,
  rounding?: RoundingType,
  stepPrecision?: boolean|number,
  tryStringToNumber?: boolean,
  returnDecimal?: boolean,
  ignoreRoundingOriginalValue?: boolean,
  ignoreRoundingParams?: boolean|(name: string) => boolean,
  nullAsZero?: boolean,
  nullIfParamNotFound?: boolean,
  eval?: null|((expr: string, dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any),
  onTrace?: (item: IFormulaValue, value: any) => void,
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

declare function formulaCalc<T extends any = any>(
  expressionOrFormula: string|Formula,
  options: FormulaCalcOptions = {},
  returnReferenceType?: T|((result: any) => T)
): T;

export default formulaCalc;
```

##### expressionOrFormula

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

##### options

以下是 `formulaCalc` 中 `options` 支持的参数的表格式说明文档：

| 参数名称 | 类型 | 默认值 | 描述 |
|---------------------------|----------------------------------------|-----------|--------------------------------------------------------------|
| params  | FormulaCalcParams\| Array\<FormulaCalcParams\> | - | 传递给表达式的参数，可以是对象或数组。若为数组，则会将数组中每个对象作为参数遍历执行表达式，并返回一个结果数组。 |
| dataSource | IFormulaDataSource | - | 传递给表达式的自定义数据源，如果不传递，则使用默认的数据源（处理params参数的获取）。若传递，则params参数的获取将由使用者自己处理。 |
| customFunctions | Record\<string, FormulaCustomFunctionItem\> | - | 自定义函数映射表，用于注册自定义函数。 |
| onFormulaCreated | (formula: Formula) => void | - | 创建公式实例后执行的回调函数。 |
| cache | boolean | false | 是否缓存公式实例，默认为 false。若为 true，则相同表达式会复用公式实例；提供 `customFunctions` 或 `onCreateParam` 时不复用缓存，以保证每次调用使用当前的解析配置。 |
| Decimal | typeof Decimal | - | 用于数值计算的 Decimal.js 自定义实例。 |
| precision | number | 2 | 设置计算结果的精度。 |
| rounding | RoundingType | 'HALF_UP' | 设置舍入类型。可选值包括：UP、DOWN、CEIL、FLOOR、HALF_UP、HALF_DOWN、HALF_EVEN、HALF_CEIL、HALF_FLOOR、EUCLID。 |
| stepPrecision | boolean \| number \| (item, value) => boolean \| number | - | 对参与步骤舍入的节点设置精度；true 跟随 precision（默认 2），数字 0 表示舍入到整数。 |
| stepPrecisionIgnorePercent | boolean | false | 步骤间的四舍五入是否忽略百分比运算，百分比数字往往会比较小，对精度影响比较大，某些情况下，可以设置为 true 来忽略stepPrecision对百分比操作的影响。 |
| tryStringToNumber | boolean | false | 是否尝试将字符串转换为数字。 |
| ignoreRoundingOriginalValue | boolean | true | 默认保留数字字面值精度；false 时允许对字面值执行 stepPrecision。 |
| ignoreRoundingParams | boolean \| (name) => boolean | true | 默认保留参数精度；回调返回 true 跳过该参数舍入，false 允许舍入，独立于原始值开关。 |
| returnDecimal | boolean | false | 是否将返回的数字类型作为 Decimal 类型进行返回。 |
| nullAsZero | boolean | false | 是否将 `null`、`undefined`、`NaN` 、`空字符串` 视为零参与计算。 |
| nullIfParamNotFound | boolean | false | 如果参数未找到，是否返回 `null`。若为false时，未找到参数将抛出异常。 |
| eval | null\|Function | - | 自定义的表达式eval函数。 |
| onTrace | null\|Function | - | 计算过程追踪函数。 |

##### returnReferenceType

`formulaCalc`的返回值类型参考参数。在`js`代码中，使用者可以通过预判的返回值类型设置`returnReferenceType`为对应的类型，以方便ide实现类型提示。

像这样：

```js
/** ide应该可以自动识别到result为number类型  */
const result = formulaCalc('1 + 1', {}, 0);
```

若`returnReferenceType`为函数，则可以在`formulaCalc`返回之前对结果值做一些处理，而该函数返回值将作为最终返回值。

#### onTrace

如果需要获取计算过程，则你可以通过配置`onTrace`自定义输出计算过程的函数。

解析生成的节点 `origText` 是该节点在输入中的原始文本，保留内部的空格、制表符、空行、换行形式和转义字符；函数节点包含完整括号和参数。子节点不包含自身范围之外的首尾空白，完整输入（包括首尾空白）保存在 `Formula.origText` 中。手动通过 `createToken` 创建节点时没有输入原文，默认使用 token 文本，也可以显式设置节点的 `origText`。

示例：
```js
const executed = [];
const result = formulaCalc('(1 + 1)', {
  onTrace(item, value) {
    console.log(`[${item.line}, ${item.column}]: ${item.origText} =`, value);
  }
});
console.log(result);

/* 
 * console output:
 *  [1, 2]: 1 = 1
 *  [1, 6]: 1 = 1
 *  [1, 2]: 1 + 1 = 2
 *  [1, 1]: (1 + 1) = 2
 *  2
 */
```


#### formulaUtils

`formulaUtils`是一些辅助工具函数(`sum`、`avg`、`min`、`max`、`round`)，以方便一些简单的不想通过表达式进行计算的场景。

```tsx
type FormulaUtilsParam = number|string|null|undefined|Decimal;
type FormulaUtilsOptions = Omit<FormulaCalcOptions, 'params'|'onCreateParam'>;

type FormulaUtils = {
  sum: (params: Array<FormulaUtilsParam>, options?: FormulaUtilsOptions) => number,
  avg: (params: Array<FormulaUtilsParam>, options?: FormulaUtilsOptions) => number,
  min: (params: Array<FormulaUtilsParam>, options?: FormulaUtilsOptions) => number,
  max: (params: Array<FormulaUtilsParam>, options?: FormulaUtilsOptions) => number,
  
  add(a: FormulaUtilsParam, b: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  sub(a: FormulaUtilsParam, b: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  mul(a: FormulaUtilsParam, b: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  div(a: FormulaUtilsParam, b: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  divToInt(a: FormulaUtilsParam, b: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  pow(a: FormulaUtilsParam, b: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  mod(a: FormulaUtilsParam, b: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,

  abs(a: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  ceil(a: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  floor(a: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  trunc(a: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  sqrt(a: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  cbrt(a: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,
  
  clamp(a: FormulaUtilsParam, min: FormulaUtilsParam, max: FormulaUtilsParam, options?: FormulaUtilsOptions) => number,

  round: (
    value: Decimal.Value,
    decimalPlaces: number = 2,
    rounding: Decimal.Rounding|RoundingType = Decimal.ROUND_HALF_UP,
  ) => number,

  toFixed: (
    value: Decimal.Value|null|undefined, 
    options: {
      precision?: number|[min: number, max: number],
      comma?: boolean,
      commaStr?: string,
      nullStr?: string,
      trimTrailingZero?: boolean,
      trimTrailingZeroIfInt?: boolean,
      rounding?: Decimal.Rounding|RoundingType,
    } = {}
  ) => number,
}

declare const formulaUtils: FormulaUtils;

export {
  formulaUtils
}
```

注意：`formulaUtils`中的`sum`、`avg`、`min`、`max`函数，默认配置了`nullAsZero`、`tryStringToNumber`、`nullIfParamNotFound`为`true`。

下面是示例：

```ts
import { formulaUtils } from 'formula-calc';

const result = formulaUtils.sum([1, 2, 3]);
console.log(result); // 6

const result = formulaUtils.sum([1, 2, 3, null, undefined, '']);
console.log(result); // 6

const result = formulaUtils.sum([]);
console.log(result); // 0

const result = formulaUtils.avg([1, 2, 3]);
console.log(result); // 2

const result = formulaUtils.avg([]);
console.log(result); // 0

const result = formulaUtils.min([1, 2, 3]);
console.log(result); // 1

const result = formulaUtils.min([]);
console.log(result); // 0

const result = formulaUtils.max([1, 2, 3]);
console.log(result); // 3

const result = formulaUtils.max([]);
console.log(result); // 0

const result = formulaUtils.round(1.2345, 3);
console.log(result); // 1.235

```

##### formulaUtils.toFixed

`formulaUtils.toFixed` 是一个用于格式化数字的工具函数，它将数字转换为字符串，并添加千位分隔符、小数点、精度等。它的`options`参数支持以下格式化参数：

| 参数名称 | 类型 | 默认值 | 描述 |
|----------|------|--------|------|
| precision | number \| [min: number, max: number] | - | 设置精度，可以是一个数字或一个包含最小和最大精度的数组。 |
| comma | boolean | false | 是否在数字中添加千位分隔符。 |
| commaStr | string | ',' | 千位分隔符的字符串，默认为逗号。 |
| commaDigit | number | 3 | 千位分隔符的间隔，默认为3。 |
| nullStr | string | '' | 如果值为 `null`、`undefined`、`NaN`、`Infinity`或其他无法转成数字类型的内容，返回的字符串。 |
| trimTrailingZero | boolean | false | 是否去除小数点后的多余零。 |
| trimTrailingZeroIfInt | boolean | false | 如果值为整数，是否去除小数点后的零。 |
| rounding | Decimal.Rounding \| RoundingType | Decimal.ROUND_HALF_UP | 设置舍入类型。可选值包括：UP、DOWN、CEIL、FLOOR、HALF_UP、HALF_DOWN、HALF_EVEN、HALF_CEIL、HALF_FLOOR、EUCLID。 |

```ts
import { formulaUtils } from 'formula-calc';

const result = formulaUtils.toFixed(1.2);
console.log(result); // '1.20'

const result = formulaUtils.toFixed(1.2, { precision: 3 });
console.log(result); // '1.200'

const result = formulaUtils.toFixed(1.2, { precision: [2, 4] });
console.log(result); // '1.20'

const result = formulaUtils.toFixed(1.234, { precision: [2, 4] });
console.log(result); // '1.234'

const result = formulaUtils.toFixed(1.23456, { precision: [2, 4] });
console.log(result); // '1.2346'

const result = formulaUtils.toFixed(1.23456, { precision: [2, 4], rounding: 'FLOOR' });
console.log(result); // '1.2345'

const result = formulaUtils.toFixed(1000.2, { comma: true });
console.log(result); // '1,000.20'

const result = formulaUtils.toFixed(100000.2, { comma: true, commaDigit: 4, commaStr: '`' });
console.log(result); // '10`0000.20'

const result = formulaUtils.toFixed(null, { nullStr: '--' });
console.log(result); // '--'

const result = formulaUtils.toFixed(1);
console.log(result); // '1.00'

const result = formulaUtils.toFixed(1, { trimTrailingZeroIfInt: true });
console.log(result); // '1'

const result = formulaUtils.toFixed(1.2, { trimTrailingZeroIfInt: true });
console.log(result); // '1.20'

```

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

- `=` 或 `==`  -  等于，如 `a = b`，如果 `a` 或 `b` 为 `undefined`，将视为 `null`

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

自定义函数必须包含以下属性：
```ts
type FormulaCustomFunctionItem = {
  preExecute?: true,
  arithmetic?: boolean,
  argMin: number
  argMax: number;
  execute: (params: any[], dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any
} | {
  preExecute: false,
  arithmetic?: boolean,
  argMin: number
  argMax: number;
  execute: (params: FormulaValues, dataSource: IFormulaDataSource, options: FormulaValueOptions, forArithmetic?: boolean) => any
}
```

| 属性名 | 类型 | 默认值 | 说明 |
|------|-----|---------|----------|
| preExecute | boolean | true | 是否在执行前预处理参数，为`true`时，所有参数将会先执行出结果后再执行`execute`。若配置了`false`时，传递给`execute`的`params`将是`FormulaValues`对象，使用者需要自己调用参数的execute方法(如`params[0].execute(dataSource, options)`)来获取参数的值。|
| arithmetic | boolean | false | 该自定义函数的运算性，为`true`时，则表示这个函数返回值将是一个数字类型(或`Decimal`类型)，若该函数作为比较操作符的参数之一时，则会尝试将另一边的参数尝试转换为数字进行比较。若为`false`时，则表示未知。|
| argMin | number | - | 最小参数数量。|
| argMax | number | - | 最大参数数量。|
| execute | (params, dataSource, options, forArithmetic) => any | - | 执行函数，包含参数、数据源和选项。另外`forArithmetic`参数表示当前函数是否是作为算数运算中的参数之一的执行过程。| 

示例：

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

## 开发验证

- `npm test -- --runInBand`：检查源码和测试文件的类型，并运行单元测试。
- `npm run coverage -- --runInBand`：检查类型，并生成测试覆盖率报告。
- `npm run typecheck`：单独检查源码和测试文件的类型。
- `npm run test:build`：生成声明和两套 JS 产物，检查 polyfill 引用、声明入口和实际计算结果。此检查在 Node 中运行，不替代目标浏览器的兼容性测试。

## 许可证

[MIT](./LICENSE)

## 步骤精度与最终精度

`stepPrecision` 默认不提前舍入数字字面值和参数，只舍入乘除、幂、百分比、avg、开方、对数和三角函数等计算节点的结果。
加减、取余、sum、max/min、abs/clamp/sign、引用、括号和条件选择不叠加舍入；round/ceil/floor/trunc、整数除法与 random 保持自身规则。
`precision` 独立作用于最终结果。Decimal 自身的有效数字精度仍由 Decimal 配置控制。

```ts
formulaCalc('1.234 * 100', { stepPrecision: 2 }); // 123.4
formulaCalc('max(1.234, 1.235)', { stepPrecision: 2 }); // 1.235
formulaCalc('2.015%', { stepPrecision: 2 }); // 0.0202（先将 2.015 舍入到 2.02）
formulaCalc('2.01%', { stepPrecision: 2, precision: 2 }); // 0.02（最终精度独立生效）
formulaCalc('1.234 * 100', { stepPrecision: 2, ignoreRoundingOriginalValue: false }); // 123
formulaCalc('a + b', {
  params: { a: 1.234, b: 2.345 }, stepPrecision: 2,
  ignoreRoundingParams: (name) => name === 'b',
}); // 3.575（a 舍入到 1.23，b 保持 2.345）
```

百分比节点按百分号前的数值舍入，相当于将实际比例结果保留 `stepPrecision + 2` 位小数；
`stepPrecisionIgnorePercent: true` 跳过该步骤，后续运算不受影响。stepPrecision 回调接收实际结果（百分比时为比例数值）。

自定义函数增加 `useStepPrecision?: boolean`，默认 true，控制其数值结果是否参与全局步骤舍入；
与控制数值转换的 `arithmetic` 分开。可通过 `getFormulaFunctionDefinitions(customFunctions?)` 获取有效函数的名称与参数数量范围。

## 执行日志的转换详情

`onTrace(item, value, details?)` 保留原有前两个参数，第三个参数提供精确值与转换记录：
`originalValue` 为节点执行后、统一处理前的值，`value` 为统一处理后的值；Decimal 值不转换为 Number。
`transformations` 按实际执行顺序记录 `{ type, before, after, precision? }`，type 为 `nullAsZero`、`stepPrecision` 或 `round`。
单纯构造 Decimal 不算转换，未改变数值的舍入不会产生记录；precision 表示存储值的小数位（百分比比例包含额外两位）。
最终 `precision` 在节点执行结束后应用，不属于节点的 `onTrace` 事件；网站根据返回结果将其显示为单独一步。

```js
formulaCalc('a * 1', {
  params: { a: 2.01 }, stepPrecision: 1,
  onTrace(item, value, details) {
    console.log(item.origText, value, details.transformations);
  },
}); // 2；乘法节点记录 2.01 → 2.0
```

## 金融函数

| 函数 | 参数 | 用途 |
| --- | --- | --- |
| `fv` | `rate, nper, pmt, pv?, type?` | 终值 |
| `pv` | `rate, nper, pmt, fv?, type?` | 现值 |
| `pmt` | `rate, nper, pv, fv?, type?` | 每期固定付款额 |
| `nper` | `rate, pmt, pv, fv?, type?` | 付款期数，可以返回小数 |
| `ipmt` | `rate, per, nper, pv, fv?, type?` | 指定期的利息部分 |
| `ppmt` | `rate, per, nper, pv, fv?, type?` | 指定期的本金部分 |
| `npv` | `rate, values` | 等间隔现金流的净现值 |

参数顺序与现金流约定参考 [Excel 金融函数](https://support.microsoft.com/en-us/excel/financial-functions-reference)。
`rate` 为每期利率，必须为有限数且大于 -1；月供使用年利率除以 12，期数也换算为月。
支出为负、收入为正；可选的 `pv` / `fv` 默认 0，`type` 默认 0（期末付款），1 表示期初付款。
`fv` / `pv` 的 `nper` 可为 0，`pmt` / `ipmt` / `ppmt` 必须大于 0；`per` 必须为 1 到 `nper` 之间的整数。
无有限非负期数解、无确定付款额、非法参数或非有限结果会抛出包含函数名的错误。

`npv` 接受非空的一维数组，每个元素代表一期，第一笔在第一期末；初始投入在当前时点时，应单独相加。
数组中的零值保留对应期数；数值字符串和空值遵循 `tryStringToNumber` / `nullAsZero`，其他非数值元素报错。
这些函数使用 Decimal 和额外保护位计算，支持自定义 Decimal、异步参数、批量计算和执行日志。
函数内部不应用步骤舍入，返回值参与 `stepPrecision`；参数表达式仍遵循自身的舍入设置，`precision` 独立作用于最终结果。

```js
formulaCalc('abs(pmt(6% / 12, 30 * 12, 1000000))', { precision: 2 }); // 5995.51
formulaCalc('fv(0, 10, -100, -500)'); // 1500
formulaCalc('initial + npv(10%, flows)', {
  params: { initial: -10000, flows: [3000, 4200, 6800] }, precision: 2,
}); // 1307.29
```

