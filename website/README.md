# Formula Calc 在线调试工作台

React 16.14、TypeScript 6、CodeMirror 5、Ant Design 3；每个组件通过 `babel-preset-react-scope-style@0.1.0` 的 Vite 集成隔离 SCSS。
直接使用仓库源码，不改变库的发布入口。

## 运行与验证

网站构建建议使用 Node.js 22（Vite 7 至少需要 Node 20.19 或 22.12）；库的运行环境要求保持不变。

```powershell
yarn install --frozen-lockfile
yarn dev:website
yarn coverage --runInBand
yarn test:website --runInBand
yarn lint
yarn build:website
yarn check:website
yarn preview:website
```

生产预览地址：http://127.0.0.1:4173/formula-calc/ 。生产产物在 `dist-website/`。
Vite 开发服务器的源码转换与依赖预构建目标为 Chrome 122；生产构建兼容 Chrome 49，使用生产预览或 Pages 产物验证。

## 使用

- 页头支持中文 / English 切换，首次按浏览器语言选择，并保存语言偏好。界面、帮助、函数补全与提示、参数校验及计算状态随语言切换；公式和参数原始值保持不变。
- 编辑公式后延迟 300ms 计算；公式或 JSON 错误时清除旧结果。同名参数保留表单草稿，表单和 JSON 模式分别保存输入。
- 表单支持数字、字符串、布尔值、null、JSON 数组与对象。数字通过 Decimal 保留输入精度。
- JSON 顶层对象计算一次；对象数组逐组计算，内部数组是参数值。缺参 / 禁用的组默认等待补齐；开启“空值按 0 处理”后，缺失、未填写或关闭的参数按 0 计算，无效输入仍需修正。
- JSON 数字遵循 JSON.parse 的精度；长数字可写成字符串，配合“数字字符串转为数值”使用。
- 输入函数名、变量路径或 `$` 自动补全，Ctrl+Space 手动触发，Enter 确认，Esc 关闭；函数参数提示跟随光标位置。
- 普通括号右上标显示引用序号，函数调用括号不编号。颜色按嵌套深度循环；有效 `$n` 与目标括号同色，鼠标悬停显示引用的原始公式，无效引用标为错误。
- 光标进入括号内部时，突出显示最内层括号并为其范围加框；函数括号、多行嵌套及 `$n` 引用定位同样支持。
- 点击每组结果查看该组日志；每步显示完整公式，框选该步计算的原始片段并显示结果。动态 eval 内部步骤单独标注，避免错误定位到外层公式。日志保留精确原文与 Decimal 数值快照。
- 结果行显示代入后的运算或函数调用，如 `1 + 2 = 3`、`sum(1, 2) = 3`；仅使用当前组已执行参数的快照，未执行的分支以 `…` 表示。空值和精度处理显示真实转换链，如 `null → 0`、`2.01 → 2.0`，步骤精度、round 与最终精度保留对应小数位；最终精度单独列为一步。
- 点击页头“API 说明”打开侧栏，运算符 / 函数分标签和分类展示；支持按名称、符号、分类和功能说明搜索。
- “金融计算”分类提供 fv、pv、pmt、nper、ipmt、ppmt、npv，每个函数有独立补全和参数提示；可加载“贷款月供”“投资净现值”示例。利率为每期利率，支出为负、收入为正，具体约定见根目录 README。
- 桌面布局压缩介绍区和公式编辑框，执行步骤与右侧参数列表各自内部滚动；窄屏及低高度窗口保留整页滚动。
- 浏览器本地保存输入及配置；恢复默认示例可重置。动态 eval 字符串里的参数不做静态识别。

## Chrome 49

构建目标为 Chrome 49，由 Babel 按浏览器兼容表转换语法。
`@vitejs/plugin-legacy` 注入 polyfill 和 SystemJS。构建检查验证旧入口、脚本没有超出 ES2015 的语法、资源路径与作用域样式；浏览器具体特性的兼容转换由 Babel 目标配置负责。
页面使用 Flex 布局及固定色值，不依赖 Grid、CSS 变量或 Flex gap。
Ant Design 3 的波纹 CSS 使用已有固定颜色回退，移除动态变量声明；只打包 Switch 所需样式和 loading 图标。
rc-switch 的历史 ESM/CJS 混合模块由 Vite `transformMixedEsModules` 处理。

静态检查和在现代浏览器加载 legacy 脚本不能代替真实 Chrome 49 验收。真实浏览器未验证时，必须说明限制。

## GitHub Pages

`.github/workflows/pages.yml` 在 main 更新或手动触发时执行核心覆盖率、网站测试、lint、类型检查、构建和产物检查，随后部署 Pages。
仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
成功后目标地址为 https://gxlmyacc.github.io/formula-calc/ 。配置 workflow 并不等于已部署，以 Actions 成功和线上访问为准。
