---
name: "edu-engine-pattern"
description: "Builds pure-data education logic engines + tests + zero-integration component hooks. Invoke when adding pedagogical features to any learning app."
---

# Education Engine Pattern (教育学引擎模式)

为教育类应用构建**纯数据逻辑层**的标准工作流。从 6 个实战引擎（readingGatekeeper / etymologyEngine / rewardThrottle / reportEngine / difficultyEngine / chantEngine）提炼。

## 触发条件

当任务符合以下任一特征时调用本 skill：

- 新建 `src/utils/xxxEngine.js`（教育逻辑引擎）
- 给现有应用加教育学铁律 / 教学策略
- 创建纯数据模块（零 DOM、零 UI 依赖）
- 需要数据 → UI 之间的中间层
- 任务涉及"教育学依据"、"铁律"、"B8/B13/B14"等教育学术语

不适用场景：纯 UI 样式、纯 DOM 操作、后端 API、第三方 SDK 集成。

## 四步工作流

### Step 1: 写教育学注释（先于代码）

每个引擎文件头部必须有 `/** ... */` 注释块，包含：

```js
/**
 * xxxEngine.js — E13 奖励降噪
 *
 * 教育学依据：
 *   B13 铁律：每分钟奖励特效（声音+视觉）不超过 3 次
 *   代币经济理论：稀缺性提升奖励感知价值
 *   过度刺激 → 奖励贬值（边际效用递减）
 *   ADHD 友好：减少视觉/听觉过载
 *
 * 技术：令牌桶算法 — 窗口内按权重消耗配额
 *
 * 职责（纯数据，零 DOM）：
 *   1. ...
 *   2. ...
 */
```

### Step 2: 构建引擎（纯数据 + 冻结常量 + 单例）

#### 必须遵守的结构

```js
// 1. 常量冻结（Object.freeze）
export const MY_CONST = Object.freeze({
  KEY_A: "value_a",
  KEY_B: "value_b",
});

// 2. 阈值集中在顶部（便于调试和调参）
const THRESHOLD_X = 80;
const THRESHOLD_Y = 0.7;

// 3. 工具函数（下划线前缀表示内部）
function _internalHelper(arg) { ... }

// 4. 公开 API — 纯函数（输入/输出都是 plain object）
export function computeSomething(inputA, inputB) {
  // 零 DOM、零 window、零 document
  // 零 side effect（除了可选的单例状态管理）
}

// 5. 可选：单例导出（需要跨调用共享状态时）
class MyEngine { ... }
export const myEngine = new MyEngine();
export { MyEngine };  // 测试用

// 6. 默认导出（可选）
export default myEngine;
```

#### 红线

- ✅ 纯函数优先（输入 → 输出，无副作用）
- ✅ 常量 Object.freeze（外部不能篡改）
- ✅ 可预测、可测试（不依赖外部状态）
- ❌ 禁止 DOM 引用（`document`, `element`, `querySelector`）
- ❌ 禁止 window API（`setTimeout`, `AudioContext` 可以在测试里 mock）
- ❌ 禁止硬编码文件路径或网络请求

### Step 3: 写单元测试（15-25 条）

#### 测试结构模板

```js
import { describe, it, expect } from 'vitest';
import { FUNCTION, CONST } from '../../src/utils/xxxEngine.js';

// 头部必须标注教育学依据注释
// E13 奖励降噪 — B13 铁律：每分钟奖励特效 ≤ 3 次

function makeInput(overrides = {}) {
  return {
    defaultA: 1,
    defaultB: "test",
    ...overrides,
  };
}

describe('CONSTANTS', () => {
  it('KEY_A immutable', () => {
    expect(CONST.KEY_A).toBe("value_a");
  });
});

describe('computeSomething — 正常路径', () => {
  it('输入 A → 输出 X', () => { ... });
  it('边界值', () => { ... });
});

describe('computeSomething — 异常/空值', () => {
  it('null 输入 → 安全兜底', () => { ... });
});

describe('edge cases', () => {
  it('...', () => { ... });
});
```

#### 测试数量分配（经验值）

| 引擎复杂度 | 测试数 | 覆盖重点 |
|-----------|-------|---------|
| 简单（4-6 函数） | 12-17 | 每个函数 2-3 条 + 边界 |
| 中等（7-10 函数） | 18-25 | 每个函数 2-4 条 + 综合场景 |
| 复杂（类 + 状态） | 20-30 | 状态转换 + 单例隔离 + 重置 |

### Step 4: 零侵入接入组件

#### 策略：最小改动原则

```
组件（e.g. LearnModule）
  │
  ├─ 1. 顶部加 import（1 行）
  ├─ 2. 在需要的位置调用引擎 API（1-3 行）
  ├─ 3. 可选：在现有 handler 里注入（e.g. btn-chant）
  └─ 4. 不动现有 UI 结构（除非任务明确要求）
```

#### 集成点类型

| 类型 | 例子 | 改动量 |
|-----|------|-------|
| 数据注入 | LearnModule 调 buildEtymologyCard(char) | +1 import, +1 调用 |
| 守卫拦截 | soundEngine 方法内加 if (!throttle.allow()) return | +1-6 处守卫，零调用点改动 |
| 事件增强 | chantBtn handler 替换成 chantEngine 版本 | 替换 1 个 handler |
| UI 面板 | ParentModule 加 AI 诊断卡片 | +1 个 template literal 块 |

#### 红线

- ✅ 调用点一行不改（守卫拦截模式）
- ✅ 不重排 DOM 结构（UI 面板模式只插入）
- ✅ 遵守目标组件的红线（e.g. ParentModule 零 Unicode Emoji）

## 实战案例速查

| 引擎 | 行数 | 常量 | 公开 API | 单例 | 测试数 | 接入方式 |
|-----|-----|-----|---------|-----|-------|---------|
| readingGatekeeper | 193 | 1 | 4 | 0 | 15 | BookModule 点击拦截 |
| etymologyEngine | 223 | 1 | 5 | 0 | 17 | LearnModule reveal-box 替换 |
| rewardThrottle | 127 | 1 | 0 | 1 | 15 | soundEngine 方法内部守卫 |
| reportEngine | 301 | 0 | 8 | 0 | 16 | ParentModule 预计算 + 面板 |
| difficultyEngine | 331 | 1 | 5 | 0 | 22 | drillEngine buildTypePool 加权 |
| chantEngine | 228 | 1 | 3 | 0 | 11 | LearnModule btn-chant handler |

## 快速启动 Checklist

1. [ ] 确认需求里的**教育学铁律/依据**（没有就先写一条）
2. [ ] 用 `cat > src/utils/xxxEngine.js << 'EOF'` 写引擎
3. [ ] 头部先写教育学注释 + 常量 Object.freeze
4. [ ] 语法检查：`node --check src/utils/xxxEngine.js`
5. [ ] 快速逻辑验证：`node -e "import(...).then(m => ...)"`
6. [ ] 写测试：`cat > tests/unit/xxxEngine.test.js << 'EOF'`
7. [ ] 跑测试：`npx vitest run tests/unit/xxxEngine.test.js`
8. [ ] 接入组件：加 import + 调用 API
9. [ ] Boot 冒烟：`node tools/_boot_smoke.mjs`
10. [ ] 全量回归：`npx vitest run`

## 调试技巧

### 快速验证新引擎逻辑

```bash
node -e "
import('./src/utils/xxxEngine.js').then(m => {
  const input = { ... };  // mock 数据
  console.log(m.functionA(input));
  console.log(m.functionB(input));
});
"
```

### vitest 跑单文件

```bash
npx vitest run tests/unit/xxxEngine.test.js
```

### 批量跑 + grep FAIL

```bash
npx vitest run 2>&1 | grep "FAIL\|✗" | head -10
```
