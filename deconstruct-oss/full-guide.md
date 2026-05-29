# deconstruct-oss 完整操作指南

## 步骤 0：确认输入

向用户确认：
- **仓库路径**：本地仓库的绝对路径
- **输出目录**（可选）：HTML 文件输出位置，默认输出到 `chzedong.github.io/<库名>/` 目录（GitHub Pages 自动部署）
- **GitHub 地址**（可选）：对应的 GitHub URL，用于分析提交记录和 Issue。如果用户提供了仓库地址（如 `https://github.com/owner/repo`），询问用户是否需要分析 GitHub 数据（需要 GitHub CLI `gh` 已认证）
- **分析深度**（可选）：`quick`（快速概览，单页面）/ `deep`（深度分析，多页面）。默认深度分析

## 步骤 1：收集基础信息

按以下顺序读取仓库信息：

### 1a. README 分析

```
ls <repo>/{README.md,readme.md,Readme.md,README,README.rst,README.txt} 2>/dev/null
```

读取 README，提取：项目简介、解决了什么问题、快速开始示例、API 概览、License、徽章信息。

### 1b. 工程化信息

```
cat <repo>/package.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('=== scripts ==='); [print(f'  {k}: {v}') for k,v in d.get('scripts',{}).items()]; print('=== dependencies ==='); [print(f'  {k}: {v}') for k,v in d.get('dependencies',{}).items()]; print('=== devDependencies ==='); [print(f'  {k}: {v}') for k,v in d.get('devDependencies',{}).items()]; print(f'type: {d.get("type","commonjs")}'); print(f'main: {d.get("main","-")}'); print(f'module: {d.get("module","-")}')"
```

识别关键工程化工具：
- 构建工具：vite/rollup/webpack/esbuild/tsc
- 包管理：pnpm/yarn/npm，是否 monorepo
- 测试框架：vitest/jest/mocha/playwright
- Lint/Format：eslint/prettier/biome
- CI/CD：`.github/workflows/`、`Jenkinsfile`、`.gitlab-ci.yml`
- Commit 规范：commitlint、husky、changesets

### 1c. 项目结构

```
find <repo> -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' | head -200
```

### 1d. 配置文件识别

```
ls <repo>/{tsconfig.json,jsconfig.json,.eslintrc.*,.prettierrc*,vite.config.*,webpack.config.*,rollup.config.*,turbo.json,lerna.json} 2>/dev/null
```

## 步骤 2：核心链路分析

### 2a. 识别入口点和核心模块

从 package.json 的 `main`/`module`/`exports` 字段找到入口文件，追踪核心导出。

### 2b. 分析核心源码目录

```
find <repo>/src -maxdepth 2 -type f 2>/dev/null | head -100
find <repo>/packages -maxdepth 3 -type d 2>/dev/null | head -100
```

### 2c. 核心链路追踪

阅读关键源文件，绘制：
- 数据流：输入 → 处理 → 输出
- 生命周期：初始化 → 运行 → 销毁
- 模块依赖图（Mermaid，标注依赖方向和数据流向）

### 2d. 关键代码引用规范 ⭐

这是文档最有价值的部分。对于每个核心模块：
1. 贴出关键代码片段（精简，只保留核心逻辑）
2. 标注文件路径和行号：`src/core/store.ts:42-68`
3. 生成本地 IDE 跳转链接：

```html
<a href="vscode://file/<absolute-path>/src/core/store.ts:42:0">在 IDE 中打开</a>
```

4. 代码注解：在代码块中用注释标注设计意图

```typescript
// ★ 设计意图：使用 WeakMap 防止内存泄漏
const storeCache = new WeakMap<Object, StoreState>()
```

### 2e. 测试用例分析 ⭐

1. 找到测试目录（`__tests__`、`*.test.ts`、`*.spec.ts`）
2. 挑选 3-5 个最具代表性的测试用例
3. 按维度分类：基础用法 / 边界情况 / 高级特性
4. 每个用例提炼为"测试场景 → 预期行为"
5. 附上精简后的测试代码

## 步骤 3：架构设计分析

重点关注以下维度：

| 维度 | 分析要点 |
|------|---------|
| 模块划分 | 按职责拆分了哪些模块？模块间如何通信？ |
| 设计模式 | 工厂/观察者/策略/装饰器/单例/适配器等 |
| 插件系统 | 注册/加载/执行流程 |
| 中间件/管道 | 执行顺序如何控制？ |
| 生命周期 | 创建/更新/销毁 |
| 状态管理 | 集中式/reducer/响应式 |
| 错误处理 | 错误分类、传播、恢复 |
| 性能优化 | 缓存/懒加载/虚拟化/增量更新 |

### 3a. "如果我来写" 对比思考 ⭐

对每个核心模块，加入一个对比框：

```html
<div class="callout callout-insight">
  <div class="callout-title">🧠 如果让你来实现...</div>
  <p><strong>问题</strong>：{模块核心问题}</p>
  <p><strong>直觉方案</strong>：{大多数开发者的第一做法}</p>
  <p><strong>该库的实际做法</strong>：{精妙之处}</p>
  <p><strong>差异分析</strong>：{为什么直觉方案不够好？}</p>
</div>
```

重点挖掘"反直觉"的设计——这往往是库作者经验更丰富的地方。

### 3b. 反模式与易错点 ⭐

从 Issues、源码注释、类型定义中提取：
1. **误用案例**：用户常犯的错误
2. **API 陷阱**：看起来正常但会出问题的用法
3. **破坏性变更**：旧写法 vs 新写法
4. **类型陷阱**：TypeScript 类型中容易误导的地方

### 3c. 关键常量与默认配置

提取默认超时时间、缓存大小、重试次数、硬编码阈值等，以表格呈现并标注设计意图。

## 步骤 4：算法与数据结构分析（如适用）

识别值得学习的算法实现：
- 解析器（Parser/Tokenizer/Lexer）
- 编译器（AST 遍历/变换/代码生成）
- 调度算法（任务调度/优先级队列）
- 图算法（依赖解析/拓扑排序）
- Diff 算法、Tree Shaking 等

每个算法说明：解决的问题、输入输出、核心思想（伪代码或流程图）、复杂度。

## 步骤 5：GitHub 历史分析（可选）

需要用户提供 GitHub 地址且 `gh` CLI 已认证。

### 5a. 关键提交分析

```
gh api "repos/<owner>/<repo>/commits?per_page=50" --jq '.[] | "\(.sha[:7]) \(.commit.message | split("\n")[0])"'
```

### 5b. 重要 Issue 分析

```
gh api "repos/<owner>/<repo>/issues?sort=comments&per_page=20&state=closed" --jq '.[] | "#\(.number) [\(.state)] \(.title) (comments: \(.comments))"'
```

### 5c. Release/Changelog 分析

```
gh api "repos/<owner>/<repo>/releases?per_page=10" --jq '.[] | "\(.tag_name) - \(.name)\n  \(.body[:200])"'
```

提取：关键决策点、Bug 修复案例、社区关注点、版本演进路线。

## 步骤 6：项目规模评估与分解策略

| 规模 | 文件数 | 策略 |
|------|--------|------|
| 小型 | < 50 源文件 | 单页面 HTML，全量分析 |
| 中型 | 50-200 源文件 | 单页面 HTML，核心模块重点分析 |
| 大型 | > 200 或 monorepo | 多页面 HTML，模块化拆解 |

大型项目拆解规则：
1. 先创建**索引页**（index.html）：项目总览 + 模块导航
2. 每个核心模块生成独立 HTML 页面（`module-<模块名>.html`）
3. 使用相对链接实现页面间跳转
4. 索引页包含：项目概览、架构总图、模块列表（带描述）、快速导航

## 步骤 7：生成 HTML 文档

使用 `skills/deconstruct-oss/template.html` 作为样式基础。

HTML 样式规范：
- 系统字体栈：`system-ui, -apple-system, sans-serif`
- 等宽字体：`SF Mono, Fira Code, Consolas, monospace`
- 白色背景 + 蓝色主题色，响应式布局
- 暗色模式支持（`prefers-color-scheme: dark`）
- Mermaid 图表（CDN 引入）
- 代码块高亮（`<pre>` + 内联样式）

生成后：
1. 将 HTML 文件写入输出目录
2. 自动提交推送到 GitHub Pages 远程仓库：

   ```bash
   # 设置代理
   export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890

   # 提交并推送
   cd chzedong.github.io
   git add .
   git commit -m "docs: deconstruct <库名>"
   git push origin main
   cd ..
   ```

3. 告知用户 Pages 访问地址：`https://chzedong.github.io/<库名>/`

## 模块化拆解详细规则

### 索引页（index.html）
- 项目全景概览（背景、技术栈、架构总览图）
- 模块导航卡片（名称、职责、链接）
- 模块依赖关系图（Mermaid）
- 快速入门（安装、运行、核心 API）

### 模块页面（module-xxx.html）
- 模块概览（职责、位置）
- 模块目录结构
- 核心类/函数详解（附代码 + 路径:行号 + IDE 跳转链接）
- 对外接口（API 签名）
- 内部实现细节
- "如果我来写"对比思考
- 设计亮点与反模式
- 与其他模块的交互
- 相关测试用例分析

### 导航
- 每个页面底部：上一页/下一页导航、返回索引链接

## 分析质量标准

1. **准确性**：代码引用可验证，不确定的标注"推测"
2. **可操作性**：每个代码引用附文件路径和行号，提供 IDE 跳转
3. **深度**：不仅描述"是什么"，解释"为什么这样设计"
4. **实用性**：标注可复用的工程实践和架构模式
5. **可读性**：合理使用图表、代码片段、表格
6. **警示性**：标注易错点和反模式
7. **关联性**：将设计与日常经验关联，提供同类库对比

## 学习路径建议规范 ⭐

每个文档在核心链路 Section 的开头提供阅读顺序建议：

```
推荐阅读顺序：
1. src/index.ts          — 入口，了解对外暴露的 API
2. src/types.ts          — 类型定义，建立心智模型
3. src/core/store.ts     — 核心实现，理解数据模型
4. src/react/useStore.ts — 框架集成方式
5. src/middleware/*.ts   — 扩展机制，了解插件模式
```

排序原则：先类型定义 → 核心数据 → 主流程 → 扩展机制 → 边缘场景。

## 注意事项

1. **只读操作**：分析只读取，不修改
2. **超大仓库**（>1000 源文件）：选核心模块即可
3. **私有仓库**：`gh` CLI 需要仓库访问权限
4. **非 Node 项目**：调整工程化分析维度
5. **已有文档**：询问覆盖还是合并更新
6. **Mermaid 渲染**：需要网络加载 CDN

## 示例代码生成规范

**原则：在深度架构分析之前，提供"快速上手"示例，让未使用过该库的读者建立直觉。**

### 示例代码应包含

1. **最小可运行示例**（3-5 行代码）— 展示核心概念的最简用法
2. **常见场景示例**（2-3 个）— 展示该库的典型使用模式
3. **与同类库的等效对比**（1 个）— 如果读者用过 Redux/Zustand 等库，提供"如果这是 X 库你会这样写，在这个库你改写成这样"

### 示例代码格式

所有示例代码放入带 class 的代码块：

```html
<pre><code>import { atom, useAtom } from 'jotai'

// 创建一个原子状态
const countAtom = atom(0)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return &lt;button onClick={() => setCount(c => c + 1)}&gt;{count}&lt;/button&gt;
}</code></pre>
```

### 示例代码位置

在文档结构中的 "Section 1: 项目背景" 之后、工程化分析之前插入一个 "快速上手" 小节。

## Mermaid 图表使用规则

**原则：复杂流程图和架构图使用 Mermaid 渲染，简单结构用 ASCII art 或纯文本描述即可。**

### 何时使用 Mermaid

| 场景 | 图类型 | 示例 |
|------|--------|------|
| 数据流 / 控制流 | `flowchart LR/TD` | 输入 → 处理 → 输出 |
| 依赖关系图 | `graph TD` | 模块间的 import 关系 |
| 架构分层图 | `graph TD` 带 subgraph | vanilla 层 → React 层 → 应用层 |
| 生命周期时序 | `sequenceDiagram` | atom 创建 → 挂载 → 更新 → 卸载 |
| 状态机 | `stateDiagram-v2` | Promise 状态：pending → fulfilled/rejected |

### 如何嵌入

```html
<pre class="mermaid">
flowchart LR
    A[atom() 创建] --> B[Store 注册]
    B --> C[useAtomValue 订阅]
    C --> D[组件渲染]
</pre>
<p class="mermaid-caption">图：atom 从创建到渲染的完整流程</p>
```

### 注意事项

- 图表用 `<pre class="mermaid">` 而非 markdown 代码块，确保 CDN 可渲染
- 每个图表下方加 `<p class="mermaid-caption">` 提供简短说明
- 节点文本用中文，节点 ID 用英文简写
- 避免单张图超过 10 个节点（超过就拆成多张）

## Issue/Commit 关键决策提取规则

**原则：从 GitHub Issues 和 Commits 中提取有教学价值的技术决策，而非罗列所有变更。**

### 值得提取的内容

1. **架构权衡**：Issue 中讨论的 "为什么不选方案 A 而选方案 B"
2. **边界 Case**：用户报告过的意外行为，以及修复方式
3. **破坏性变更的原因**：从 milestone/migration guide 中提取 WHY
4. **性能优化案例**：commit message 中出现 "perf" / "optimize" 的提交

### 呈现格式

在文档中创建 "关键决策时间线" 小节：

```html
<h3>关键决策时间线</h3>
<table>
  <tr><th>版本</th><th>决策</th><th>为什么</th></tr>
  <tr>
    <td>v2.18.0</td>
    <td>jotai/babel 拆分为独立包 jotai-babel</td>
    <td>减少核心包体积，Babel 插件使用场景有限</td>
  </tr>
</table>
```

### 提取方法

1. 用 `fetch_url` 获取 releases API：`/repos/owner/repo/releases?per_page=10`
2. 从每个 release 的 `body` 字段找 "breaking" / "feat" 关键词
3. 高价值 Issue 通过 `/repos/owner/repo/issues?sort=comments&per_page=10&state=closed` 获取
4. 只提取 3-5 个最有教学价值的条目，不堆砌数字
