# 凯茜识字 · 数据清单（DATA INVENTORY）

> 更新日期：2026-09-05 · 原则：数据默认仅存本设备，不上传云端账号体系。

## 总览

| 类别 | 存储位置 | 上传 | 删除入口 |
|------|----------|------|----------|
| 学习进度 / FSRS | localStorage（按档案键）+ IndexedDB 镜像 | 否 | 家长中心 → 清除数据 |
| 多孩子档案列表 | localStorage `CATHY_PROFILES_LIST` | 否 | 家长中心（门禁）删除档案 |
| 绘本进度 / 录音元数据 | localStorage / IndexedDB | 否 | 清除数据 |
| 麦克风评测音频 | 内存 Blob，评测后丢弃 | 否 | 关闭语音评测开关 / 拒授权 |
| 麦克风同意标记 | localStorage `cathy_mic_consent` | 否 | 清除数据 |
| 触感开关 | localStorage `cathy_haptics` | 否 | 家长设置 |
| 今日任务完成 | localStorage `cathy_daily_quest_done` | 否 | 跨日自然失效 / 清除数据 |
| 树屋浇水等 | localStorage `cathy_tree_*` | 否 | 清除数据 |
| 家长语音模板（可选） | IndexedDB | 否 | 清除数据 |
| 本地 TTS（可选） | 本机 `127.0.0.1:8766` | 仅本机环回 | 停用本机语音服务 |

## 敏感操作 × 家长门禁

| 操作 | 门禁 | 代码位置 |
|------|------|----------|
| 进入家长中心 | ✅ | `appNavigation.js` |
| 跳过护眼休息 | ✅ | `eyeCareManager.js` |
| 首次麦克风评测授权 | ✅ + 持久同意 | `pronunciationEval.js` |
| 导出进度 JSON | ✅ | `parentDashboardEvents.js` |
| 导入同步码 | ✅ | `parentDashboardEvents.js` |
| 清除全部数据 | ✅ + 二次确认 | `parentDashboardEvents.js` |
| 切换 / 新建 / 重命名 / 删除档案 | ✅ | `parentDashboardEvents.js` |

## 儿童可见内容

- Chrome UI 禁止 emoji（见 `uiChromeNoEmoji.test.js`）
- 外链 / 联系方式扫描（见 `childContentSafety.test.js`）
