# deconstruct-tech 完整操作指南

## 步骤 0：确认输入

向用户确认：

- **对象名/路径**：本地仓库路径、技术概念名、协议名等
- **对象类型**（自动判断，可人工校正）：
  - `library` — 库/工具/CLI
  - `framework` — 框架/平台
  - `concept` — 概念/设计模式
  - `paradigm` — 范式/方法论
  - `protocol` — 协议/标准
- **输出目录**（可选）：HTML 文件输出位置，默认 `chzedong.github.io/<对象名>/`
- **Source 来源**（可选）：GitHub 地址、官方文档、RFC 链接、论文等
- **分析深度**（可选）：`quick`（快速概览，单页面）/ `deep`（深度分析，多页面）。默认深度分析

## 步骤 1：收集基础信息

根据对象类型选择信息采集策略。

### 1a. Library / Tool / CLI

**README 分析**

```bash
ls <repo>/{README.md,readme.md,Readme.md,README,README.rst,README.txt} 2>/dev/null
```

提取：项目简介、解决了什么问题、快速开始示例、API 概览、License、徽章信息。

**工程化信息**

```bash
cat <repo>/package.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('=== scripts ==='); [print(f'  {k}: {v}') for k,v in d.get('scripts',{}).items()]; print('=== dependencies ==='); [print(f'  {k}: {v}') for k,v in d.get('dependencies',{}).items()]; print('=== devDependencies ==='); [print(f'  {k}: {v}') for k,v in d.get('devDependencies',{}).items()]; print(f'type: {d.get(\"type\",\"commonjs\")}'); print(f'main: {d.get(\"main\",\"-\")}'); print(f'module: {d.get(\"module\",\"-\")}')"
```

识别关键工程化工具：构建工具、包管理、测试框架、Lint/Format、CI/CD、Commit 规范。

**项目结构**

```bash
find <repo> -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' | head -200
```

### 1b. Framework / Platform

- 读取官方文档的「Getting Started」「Core Concepts」「Plugins」
- 识别核心抽象：例如 Plugin、Middleware、Adapter、Hook
- 扫描源码目录，找到核心包/模块

### 1c. Concept / Pattern

- 读取 MDN / Wikipedia / 经典博客
- 收集 2-3 个典型实现（不同语言或库）
- 记录常见误用案例

### 1d. Paradigm / Methodology

- 阅读起源论文/书籍章节
- 列出核心原则（3-5 条）
- 收集在主流语言/框架中的体现

### 1e. Protocol / Standard

- 读取 RFC/规范原文的关键章节
- 收集官方文档与实现库
- 画出角色与时序

## 步骤 2：用法分析

无论对象类型，都必须输出以下内容：

1. **一句话定义**
2. **最小可运行示例**（3-5 行代码或配置）
3. **2-3 个常见使用场景**
4. **API / 配置速查表**
5. **最佳实践**（callout-tip）
6. **踩坑与反模式**（callout-warning）

### 示例代码规范

```html
<pre><code>import { atom, useAtom } from 'jotai'

// 创建一个原子状态
const countAtom = atom(0)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return &lt;button onClick={() => setCount(c => c + 1)}&gt;{count}&lt;/button&gt;
}</code></pre>
```

概念/范式类用伪代码或 JavaScript 示例即可。

## 步骤 3：原理分析

### 3a. 建立心智模型

用一句话 + 一张 Mermaid 图建立直觉：

```html
<div class="mental-model">
  <h4>🧠 心智模型</h4>
  <p>Jotai 把状态拆成不可再分的「原子」，组件只订阅自己需要的原子，更新时只重渲染相关组件。</p>
</div>
```

### 3b. 追踪核心链路

- **Library/Framework**：从入口到核心实现，绘制数据流/生命周期
- **Concept**：从问题到解决方案，绘制变化前后对比
- **Paradigm**：从思想到代码，绘制原则映射
- **Protocol**：从请求到响应，绘制时序图/状态机

### 3c. 关键代码/规范引用 ⭐

**代码引用格式**：

```html
<div class="code-ref">
  <div class="code-ref__header">
    <span class="code-ref__path">src/core/store.ts:42-68</span>
    <a class="code-ref__link" href="vscode://file/<absolute-path>/src/core/store.ts:42:0">在 IDE 中打开</a>
  </div>
  <pre><code>// ★ 设计意图：使用 WeakMap 防止内存泄漏
const storeCache = new WeakMap&lt;Object, StoreState&gt;()</code></pre>
  <div class="code-ref__notes">Store 缓存使用 WeakMap，避免组件卸载后仍持有引用。</div>
</div>
```

**规范引用格式**：

> RFC 7540 §3.2："A connection can contain multiple streams..."

### 3d. 算法与数据结构（如适用）

识别值得学习的算法：Parser / AST / Diff / 调度 / 状态机 / 拓扑排序。
每个算法说明：解决的问题、输入输出、核心思想（伪代码或流程图）、复杂度。

## 步骤 4：架构/生态/实现分析

### 4a. Library / Framework

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

### 4b. Concept / Pattern

- 典型实现的代码结构
- 常见变体与演进
- 与其他概念的关系

### 4c. Paradigm / Methodology

- 核心原则表格
- 在主流语言/框架中的映射
- 组织成本与学习曲线

### 4d. Protocol / Standard

- 角色定义
- 状态机/报文格式
- 安全与兼容性注意

### 4e. 「如果我来写」对比思考 ⭐

每个核心模块/概念加入一个对比框：

```html
<div class="callout callout-insight">
  <div class="callout-title">🧠 如果让你来实现...</div>
  <p><strong>问题</strong>：{核心问题}</p>
  <p><strong>直觉方案</strong>：{大多数开发者的第一做法}</p>
  <p><strong>实际做法</strong>：{精妙之处}</p>
  <p><strong>差异分析</strong>：{为什么直觉方案不够好？}</p>
</div>
```

## 步骤 5：历史分析（可选）

### 5a. Library / Framework

需要 `gh` CLI 已认证：

```bash
gh api "repos/<owner>/<repo>/commits?per_page=50" --jq '.[] | "\(.sha[:7]) \(.commit.message | split("\n")[0])"'
gh api "repos/<owner>/<repo>/issues?sort=comments&per_page=20&state=closed" --jq '.[] | "#\(.number) [\(.state)] \(.title) (comments: \(.comments))"'
gh api "repos/<owner>/<repo>/releases?per_page=10" --jq '.[] | "\(.tag_name) - \(.name)\n  \(.body[:200])"'
```

### 5b. Protocol / Standard

- 收集 RFC 版本与变更点
- 标记关键决策：为什么字段这样设计、为什么弃用某个方案

### 5c. Concept / Paradigm

- 收集论文发表时间、首次实现、主流语言采纳时间
- 标记从学术概念到工程实践的转化点

## 步骤 6：项目规模评估与分解策略

| 规模 | 内容量 | 策略 |
|------|--------|------|
| 小型 | 单一概念/小型库 | 单页面 HTML，全量分析 |
| 中型 | 中等库/复杂概念 | 单页面 HTML，核心模块重点分析 |
| 大型 | 框架/monorepo/复杂协议 | 多页面 HTML，模块化拆解 |

大型对象拆解规则：
1. 先创建**索引页**（index.html）：总览 + 模块导航
2. 每个核心模块生成独立 HTML 页面（`module-<模块名>.html`）
3. 使用相对链接实现页面间跳转
4. 索引页包含：概览、架构总图、模块列表、快速导航

## 步骤 7：生成 HTML 文档

使用 `skills/deconstruct-oss/template.html` 作为样式基础。

### 7a. Header 区域

必须包含：

```html
<header class="page-header">
  <h1>{对象名}</h1>
  <p class="subtitle">{一句话定义}</p>
  <div class="badges">
    <span class="badge badge-primary">{类型}</span>
    <span class="badge badge-success">L1-L4</span>
    <!-- 相关链接 -->
  </div>
  <div class="level-tabs">
    <a href="#overview" class="level-tab">L1 概览</a>
    <a href="#usage" class="level-tab active">L2 用法</a>
    <a href="#principle" class="level-tab">L3 原理</a>
    <a href="#deep" class="level-tab">L4 精通</a>
  </div>
</header>
```

### 7b. 决策框

```html
<div class="decision-box">
  <div class="decision-box__section decision-box__yes">
    <h4>✅ 适合使用</h4>
    <ul>...</ul>
  </div>
  <div class="decision-box__section decision-box__no">
    <h4>❌ 不适合使用</h4>
    <ul>...</ul>
  </div>
</div>
```

### 7c. 概念图谱

```html
<pre class="mermaid">
graph LR
    A[原子状态] --> B[Store 注册]
    B --> C[组件订阅]
    C --> D[细粒度重渲染]
</pre>
<p class="mermaid-caption">图：Jotai 的核心数据流</p>
```

### 7d. 对照矩阵

```html
<table class="comparison-table">
  <tr><th>维度</th><th>Jotai</th><th>Zustand</th><th>Redux</th></tr>
  <tr><td>状态粒度</td><td>原子</td><td>单一 Store</td><td>单一 Store</td></tr>
</table>
```

### 7e. 术语表

```html
<dl class="glossary">
  <dt>Atom</dt><dd>不可再分的最小状态单元。</dd>
  <dt>Store</dt><dd>持有 atom 与其订阅关系的运行时对象。</dd>
</dl>
```

## 输出与发布

生成后：

1. 将 HTML 文件写入 `chzedong.github.io/<对象名>/`
2. 在 index.html 的 `<head>` 中加入对象类型 meta：

   ```html
   <meta name="tech-type" content="concept">
   ```

3. 更新导航（如网络需要代理，先设置 `http_proxy`/`https_proxy`）：

   ```bash
   # 可选：export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890
   node scripts/update-nav.js
   ```

4. 提交并推送：

   ```bash
   cd chzedong.github.io
   git add .
   git commit -m "docs: deconstruct <对象名>"
   git push origin main
   cd ..
   ```

5. 告知用户 Pages 访问地址：`https://chzedong.github.io/<对象名>/`

## 模块化拆解详细规则

### 索引页（index.html）
- 对象全景概览（背景、技术栈、架构总览图）
- 模块导航卡片（名称、职责、链接）
- 模块依赖关系图（Mermaid）
- 快速入门（安装、运行、核心 API）

### 模块页面（module-xxx.html）
- 模块概览（职责、位置）
- 模块目录结构
- 核心类/函数详解（附代码 + 路径:行号 + IDE 跳转链接）
- 对外接口（API 签名）
- 内部实现细节
- 「如果我来写」对比思考
- 设计亮点与反模式
- 与其他模块的交互
- 相关测试用例分析

### 导航
- 每个页面底部：上一页/下一页导航、返回索引链接

## 分析质量标准

1. **准确性**：代码引用可验证，不确定的标注「推测」
2. **可操作性**：每个代码引用附文件路径和行号，提供 IDE 跳转
3. **深度**：不仅描述「是什么」，解释「为什么这样设计」
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
