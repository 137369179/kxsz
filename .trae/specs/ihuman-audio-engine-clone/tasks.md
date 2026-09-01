# 洪恩识字音频引擎 1:1 深度克隆 - Implementation Plan

## Task 1: 总线架构升级（五路子通道优先级队列 + 栈式闪避调度器）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 在现有 Master/BGM/Voice/SFX 四级 GainNode 基础上，拆分 Voice 为 5 条子通道 GainNode：`voice_char`、`voice_word`、`voice_sentence`、`voice_tutor`、`voice_eval`，每条有独立优先级 (1=highest, 5=lowest)；
  - 实现 `PrioritySpeechQueue`：入队按 priority 排序；高优先级触发时打断当前低优先级，被打断节点压入 `resumeStack`；高优先级结束后按 LIFO 弹栈 resume；
  - 升级闪避系统为栈式 `DuckStack`：支持三种策略 A/B/C（char_duck / tutor_duck / eval_duck），每 push 一个策略记录目标 gain 与 attack/release，重复进入不重复 ramp，弹栈后才恢复；
  - 新增全局 DynamicsCompressor 节点（threshold -24dB, ratio 4, knee 30, attack 0.003, release 0.25）防止 32 路并发时削波；
  - 暴露 `EVENTS.AUDIO_BUS_STATE_CHANGE` 总线事件（每次路由变化 emit）。
- **Acceptance Criteria Addressed**: AC-1, AC-7 (partial), NFR-2
- **Test Requirements**:
  - `rule` TR-1.1: `run_AC_1_scenario()` 返回 `{interruptOk: true, duckOrderOk: true, resumeOk: true}`；证据=测试脚本 stdout + audioCtx 节点数计数。
  - `rule` TR-1.2: 并发 32 音（16 SFX + 8 BGM 音 + 4 char + 2 word + 2 tutor）播放 10s，Compressor 输出波形 peak ≤ 0.999；证据=离线导出波形分析。
- **Notes**: 修改主文件 [soundEngine.js](file:///Users/mac/Desktop/识字/src/utils/soundEngine.js) 构造函数与 init/duckBGM/restoreBGM/speak。

## Task 2: G2P 汉字→拼音前端（多音字消歧 + 连读变调规则引擎）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 新建 `src/utils/g2pFrontend.js` 模块；
  - 内置 characters.js 字表中全部字的拼音基础字典 + 100+ 常用多音字上下文规则（按 POS 模式 / 词典匹配双判定）；
  - 实现 6 类连读变调规则：轻声 (neutral)、儿化 (er)、`一/七/八/不` 变调、上上相连 (T3+T3→T2)、`啊` 音变、"一" 在"个、些、点、年、天、次"前读去声等；
  - 对外 API：`G2P.convert(text, context)` → `Array<{char, pinyin, initial, final, tone_number, sandhi_applied, duration_ms, stress_level, is_polyphone_flag}>`；
  - 内置 30 组标准测试集，导出 `G2P.testSuite()` 返回 `{accuracy, cases:[{input, expected, got, pass}]}`。
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-2.1: `G2P.testSuite().accuracy === 1.0`；证据=测试用例结果。
- **Notes**: 多音字消歧表参考《现代汉语通用字多音字读音规范》，优先覆盖 characters.js 中所有出现的多音字形（如：行、乐、重、长、好、还、一、不、啊、数、着、了、过、地、得 的等）。

## Task 3: 童声声学级 DSP 后处理链 + 4 声调 Pitch 包络器
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - 在 [soundEngine.js](file:///Users/mac/Desktop/识字/src/utils/soundEngine.js) 中新增 `createChildVoicePostProcessorChain()` 方法构建 DSP 链：voice 子 Gain → 3× BiquadFilter (LowShelf @350Hz +2dB, HighShelf @3.2kHz +3dB, Peaking @2.8kHz +1.5dB Q=1.4) → DynamicsCompressor → voiceGain；
  - 升级 `playToneSlide` 为 `playPhonemePitchEnvelope(pinyin, options)`：支持标准拼音音节（含轻声 tone=0 / 儿化 final='er'）；使用 OscillatorNode scheduled automation 生成 F0 轨迹，8 子段折线拟合 DTW 目标曲线；
  - 新增 `ToneSlideValidator` 采样钩子：允许在单字播放时通过 `onPitchSample(freq, time)` 回调获得 100 点/音节采样，计算与标准轨迹 DTW 距离；
  - 对 `speak()` 方法增加 pitchBias/rateBias/filterBias 三参数，配合 speechSynthesis 输出实现童声"软 DSP"增强（浏览器 TTS 输出端通过 AudioDestinationNode 的 AudioParam 无法直接处理 → 因此童声模式还提供 `speakCharacterDSP` 使用纯 Web Audio 合成的"汉字音节"替代语音模式作为 fallback 对比）。
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `rule` TR-3.1: 播放"妈麻马骂" `ToneSlideValidator.report()` DTW 四项全部在阈值内；证据=JSON 报告。
  - `rubric` TR-3.2: 维度=童声自然度；scale 1-5；锚点 1=机械 3=向童声 5=甜美；阈值 ≥ 4；证据=至少 3 人盲评 10 段样本（妈妈、好的、小朋友、学习、美丽、花园、吃饭、老虎、太阳、苹果）平均得分。
- **Notes**: 由于浏览器 speechSynthesis 输出无法直接注入 Web Audio DSP 链，童声 DSP 对纯合成音（playPhonemePitchEnvelope）100% 生效；对 TTS 仅控制 pitch/rate 组合。两者共同构成声学级克隆的"双通道模式"。

## Task 4: 三档朗读模式（单字/词组/句子）+ 韵律停顿矩阵 + 情绪参数矩阵
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - 在 CathyAudioEngine 中实现三套新 API：
    - `speakCharacter(char, opts)`：默认 duration 450ms，可选 {repeatCount, mode: 'standard'|'slow'|'karaoke'}，slow 模式 duration ×1.8，karaoke 模式伴随逐字 DOM highlight 事件；
    - `speakWord(word, opts)`：自动套用词内重音模式（动宾、偏正、叠词、轻声词规则），调用 G2P 获取 word 级韵律；
    - `speakSentence(text, opts)`：解析标点（顿号/逗号/分号/句号/问号）生成停顿计划（80/180/260/420/380ms），问号最后一字音高自动+12% 模拟升调；
  - 新增 `EmotionMatrix`：joy / encouragement / correction / mystery / warmth / victory 六向量，每向量映射 {pitchOffset: ±0.15, rateMul: 0.85~1.15, gainMul: 0.9~1.1, tailShape: 'rise'|'fall'|'hold'}，每次调用加入 5% random jitter 避免机械重复；
  - 扩展鼓励词库至 12 条，并按情绪分桶；
  - 暴露 EVENTS.AUDIO_SPEAK_PROGRESS(char_index, char, time_ms, total) 进度事件。
- **Acceptance Criteria Addressed**: AC-8 (partially via emotion matrix)
- **Test Requirements**:
  - `rule` TR-4.1: `speakSentence("你好，小朋友！今天我们来学习汉字吧？")` 的标点停顿时长在停顿矩阵 ±15% 内；证据=Web Audio 调度时间戳 dump。
  - `rubric` TR-4.2: 维度=情绪语气可辨识度；scale 1-5；锚点 1=无区别 3=鼓励/纠正区分 5=6 类全自然区分；阈值 ≥ 4；证据=6×3 样本情感混淆矩阵（3 人标注）分类准确率 ≥ 75%。
- **Notes**: speakSentence 内部实际通过切分子 utterance 调度（因为单一 SpeechSynthesisUtterance 无法插入精确停顿），这是业界标准做法。

## Task 5: 笔顺-语音帧级同步控制器（StrokeVoiceSync）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 新建 `src/utils/strokeVoiceSync.js`；
  - 从 HanziEngine 订阅 `stroke.start(t, strokeIdx, strokeType)` 和 `stroke.end(t, ...)` 事件（如无此事件则在 hanziEngine.js 中新增 emit，使用 `performance.now()` 时间戳）；
  - SyncController 使用单一全局时钟源 `audioCtx.currentTime`，将 DOMHighResTimeStamp → AudioContextTime 换算并绑定：
    - stroke.start → `playStrokeSound(panFromStrokePos)`，pan 值根据笔画 x 坐标计算 (-1~+1)；
    - stroke.end → `speakStrokeName(strokeType)` 播放"横、竖、撇、捺、点、折、钩、提"八个基础笔画名称语音（使用 G2P + voice_char 通道）；
  - 新增 `StrokeSyncValidator.run(char)`：捕获 10 笔画 × (start+end) = 20 个事件对，判定每对时间差 ≤ 16ms；
  - 暴露 EVENTS.AUDIO_STROKE_SYNC(strokeIdx, eventType, deltaMs)。
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-5.1: `StrokeSyncValidator.run("大")` (3 画) 全部帧达标；证据=log 输出。
  - `rule` TR-5.2: 对 10 个不同结构字（独体/左右/上下/包围/半包围/品字）运行同步器，每字 6 种笔画类型全覆盖且无未定义 strokeType；证据=覆盖率报告。
- **Notes**: 必须先读取 [hanziEngine.js](file:///Users/mac/Desktop/识字/src/utils/hanziEngine.js) 确认其笔顺渲染事件的现有 API，若无则扩展 hanziEngine.js 增加事件钩子。

## Task 6: 实时跟读评测引擎（Pronunciation Assessment Engine）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - 新建 `src/utils/pronunciationAssessment.js`；
  - ASR 接入：封装 `webkitSpeechRecognition` / `SpeechRecognition`，lang='zh-CN'，interimResults=true，maxAlternatives=5；
  - 状态机：`IDLE → PLAYING_STANDARD → RECORDING → ALIGNING → SCORING → RESULT`；
  - `eval_duck` 策略在 RECORDING 期间将 BGM=0 SFX=0.3；
  - 音素对齐：将 ASR 结果与预期文本都走 G2P → Pinyin 归一化 → Levenshtein 距离对齐，获得每个位置的 match/mismatch；
  - 三维打分：
    - PA (Pronunciation Accuracy) = (匹配音节数 / 预期音节数) × 100；
    - SR (Speech Rate)：根据录音实际时长与标准时长比计算，偏离 > ±30% 扣分；
    - CM (Completeness)：识别音节长度覆盖预期的比例；
  - 综合 = 0.5PA + 0.3SR + 0.2CM；综合分映射 combo(1,2,3) 或错误提示；
  - 错音定位：单字粒度 mismatch 触发对应纠错引导语模板，例如错声调→播放正确声调滑音 + 语音；错声母→播放最小对立体对比；
  - Safari 降级模式：无 SpeechRecognition 时显示手动打分面板（三颗星点击）。
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-6.1: Chromium 环境下连续 5 次跟读"大"均在 4s 内返回 [0,100] 范围内分数且无异常；证据=console log。
  - `rule` TR-6.2: eval_duck 在 RECORDING 期间 BGM gain=0；证据=audioCtx 实时值读取。
  - `rule` TR-6.3: Safari 降级模式手动打分可正常触发 combo 音效；证据=UI 操作测试。
- **Notes**: 需要用户首次使用时麦克风权限；隐私 UI 提示需在 LearnModule 跟读按钮下方显示。

## Task 7: 6+ 场景 BGM 扩展 + 交叉淡入淡出 + 切换压测工具
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 扩展 playBGM 场景至 9 种：map / learn / arcade / story / review / battle / victory / night / silence；
  - 每种场景定义完整配器包：
    - 和弦进行 chordProgression；tempoMs；osc.type 分布（triangle:sine:sawtooth 比例）；
    - DynamicsCompressor 该场景的 preset（threshold/knee）；
    - 低音层：低频 sub osc，每 4 拍一次；
    - 打击层：木琴高频 click 每 2 小节点缀；
  - 交叉淡入淡出：`switchBGM(newType)` 方法，旧 bgmTimer 在 600ms 内通过 gain 指数衰减到 0 后清定时器；新场景在 200ms offset 后启动 600ms fade-in；
  - 新增 `BgmSwitchStressTest(rounds=100, intervalMin=450, intervalMax=550)` 压测工具，记录 glitchCount（连续 sample 超 ±0.999 次数）和 bgmTimer 实例数量；
  - BGM 切换通过 EVENTS.AUDIO_BGM_CHANGED(old, new, transitionMs) 广播。
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `rule` TR-7.1: `BgmSwitchStressTest(100).glitchCount === 0` 且 `activeBgmTimerCount === 1`；证据=压测报告 JSON。
  - `rule` TR-7.2: 9 场景全启动一遍，每种场景至少 4 小节合成无异常终止；证据=bgmStep 递增日志。

## Task 8: 儿歌律动合成引擎（Kids Chant Synthesizer）+ 5 首经典样例
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1, Task 3
- **Description**:
  - 新建 `src/utils/kidsChantEngine.js`；
  - 旋律音符表示 DSL：`[{noteName:'C5', len:'q'}, ...]` (q=四分, e=八分, ed=附点八分, h=二分)；
  - 支持节奏模板：三字三字经（q q q | q q q 休止 q）；
  - 五声音阶 C 大调（C D E G A / 1 2 3 5 6）；
  - 合成链：旋律 osc (triangle) + 鼓机底鼓 (40Hz sine 50ms thump) + 木鱼 (1.2kHz noise burst 8ms)；
  - 内置 5 首样例片段（8~16 小节）：
    1. 《一二三四五》上山打老虎：1 2 3 4 5 | 5 4 3 2 1；
    2. 《数鸭子》引子：3 3 5 6 | 5 - - -；
    3. 《拍手歌》：1 1 5 5 | 6 6 5 -；
    4. 《小星星》：1 1 5 5 | 6 6 5 -；
    5. 《找朋友》：5 6 5 | 3 2 1 | 2 3 5 | 3 2 -；
  - API: `chantEngine.play(titleOrNotes, {tempoBPM=100, loop=false, onBar(n)})`；
  - ChantGraphValidator 检查合成图节点数。
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `rule` TR-8.1: `chantEngine.play("star")` 渲染 8 小节，包含旋律 osc ≥ 16 个节点 + 木鱼鼓点节点 ≥ 8 个；证据=节点图 dump。
  - `rule` TR-8.2: 5 首样例的首句可通过人耳识别为对应儿歌曲调（开发者自听验证或波形频谱比对）。

## Task 9: 家长语音录制/存储/回放链路 (MediaRecorder + IndexedDB)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 新建 `src/utils/parentVoiceManager.js`；
  - 6 类触发点配置：`{startLearn, finishLearn, wrongStroke, correctStroke, startReview, eyeCare}`；
  - 使用 `navigator.mediaDevices.getUserMedia({audio:true})` + MediaRecorder 录制 audio/webm mimeType；
  - 录制前 3-2-1 倒计时 + 最大 30 秒自动停止；
  - 存储到 IndexedDB `parent_voice_store`：key = triggerType, value = {blobUrl, createdAtMs, durationMs}；使用 idb 轻量封装或原生；
  - 回放：当对应事件触发时（如护眼提醒）优先播放家长录制语音，播放完才走默认 TTS；
  - 清除 API：`parentVoiceManager.clearAll()` 或单条清除；
  - UI：ParentModule 中提供录制面板 + 录音波形预览（使用 AnalyserNode 实时波形）。
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rule` TR-9.1: 录制 → 刷新页面 → 触发护眼事件 3 步链路走通且播放家长录音（而非默认 TTS）；证据=手动端到端测试 + IndexedDB 记录。
  - `rule` TR-9.2: 单条录制大小 ≤ 1MB（30秒语音），存储容量限制 6×2MB = 12MB 内告警。

## Task 10: 音量持久化 + 家长锁 + 耳机检测听力保护
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 所有音量/静音配置：`localStorage.cathy_audio_profile_v1 = {master, bgm, sfx, voice, muted, parentUnlocked}` 读写 API `AudioSettings.save()` / `AudioSettings.load()` 带 schema 版本号；
  - 家长锁：音量 icon 长按 3 秒 → 弹出 6 位数字锁（或简单 `confirm("家长操作确认")`）→ 解锁后可调整所有音量 + 最大音量限制；
  - 耳机检测：`navigator.mediaDevices.addEventListener('devicechange')` 轮询 sink devices，当 label 或 kind 含 "headphone/earphone/headset" 时将 master 音量降到 `min(current, 0.7)`，并在 UI 音量按钮旁显示 🎧 图标；
  - 听力保护：累计播放时长超 20 分钟时，自动将 voice 通道增益临时降低 10%，下次启动会话恢复；
  - 与 [SharedShell.js](file:///Users/mac/Desktop/识字/src/components/SharedShell.js) 顶部音量/静音 UI 对接。
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-10.1: 手动触发 devicechange（耳机插入）后 volume=0.7 且 🎧 可见；证据=DOM + 设置值快照。
  - `rule` TR-10.2: 刷新页面后所有音量值维持原状（从 localStorage 成功加载）。
  - `rule` TR-10.3: 长按 3 秒解锁家长锁后可调 master 到 1.0；未解锁时最大 0.7 限制生效。

## Task 11: 内存泄漏安全探针 + DebugPanel 调试面板 + AC-9 2h 压测
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, 3, 4, 5, 6, 7, 8, 9, 10（即所有使用 AudioNode 创建的任务完成后）
- **Description**:
  - 在 CathyAudioEngine 新增 _nodeRegistry：所有 createOscillator / createBufferSource / createGain / createBiquadFilter 包装，统一注册 `onended → disconnect → unregister` 回收链；
  - 暴露 `window.CathyAudioEngine.debugPanel()`：
    - 展示当前所有节点数量 (Osc / BufferSource / Gain / Biquad / Panner / Compressor)；
    - 总线每路实时 rms 电平 20 条柱状图 (AnalyserNode.getByteTimeDomainData)；
    - 闪避栈 DuckStack 内容；
    - PrioritySpeechQueue 队列和 resumeStack；
    - Pitch 实时轨迹曲线（最近 4 秒滚动 FFT 显示）；
    - 设置面板：可切换儿童 DSP / 直接系统 TTS 模式；
  - 新增 `MemoryLeakProbe(durationMs=3600000, sfxPerSec=1.4, speakEvery=14s, bgmSwitchEvery=36s)`：在 2h 内每 10 分钟采样一次 usedJSHeapSize + nodeCount，最后回归斜率计算；
  - NFR-7 调试面板作为 AC-9 的基础设施保证。
- **Acceptance Criteria Addressed**: AC-9, NFR-3, NFR-7
- **Test Requirements**:
  - `rule` TR-11.1: `MemoryLeakProbe` 2h 报告 `leakRateBelowThreshold === true`（heap 斜率 ≤ 2KB/1000 SFX，节点基线 ±2%）；证据=报告 JSON + Heap Snapshot（前后各一张）。
  - `rule` TR-11.2: debugPanel() DOM 成功挂载且包含 6 项关键数据；证据=面板截图。

## Task 12: 集成回归测试 + 所有 AC 探针入口 + 模块对接
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1-11 全部
- **Description**:
  - 新建 `_dev_audio_test.html`（参考 [_dev_learn_test.html](file:///Users/mac/Desktop/识字/_dev_learn_test.html) 风格）：
    - 12 个 AC 测试按钮 + 结果显示区；
    - 童声 DSP 开/关对比试听；
    - G2P 30 组多音字测试一键运行；
    - 跟读评测 Demo 页；
    - 笔顺同步 Demo 页；
    - 9 场景 BGM 切换器；
    - 儿歌 5 首播放按钮；
    - 家长语音录制 Demo；
    - 耳机检测 / 家长锁 / 护眼播放 Demo；
    - DebugPanel 嵌入；
  - 将新 G2P / StrokeSync / PronunciationAssessment / ChantEngine / ParentVoice / Settings 等 API 挂到 LearnModule、SharedShell、app.js 现有流程：
    - LearnModule 认字阶段：点击大汉字 → speakCharacter + 高亮拼音 → 自动 playToneSlide；
    - 写笔顺阶段：StrokeVoiceSync 启动；
    - 练/测阶段：新增跟读按钮（如果当前浏览器支持 ASR）；
    - 完成阶段：Victory BGM + Fanfare SFX；
  - 所有对外事件走 EventBus EVENTS.AUDIO_* 新常量。
- **Acceptance Criteria Addressed**: 全部 AC-1 ~ AC-12 的端到端集成证据采集
- **Test Requirements**:
  - `rule` TR-12.1: `_dev_audio_test.html` 12 个 AC 按钮点击后，至少 8 rule AC 全部显示 PASS；证据=页面截图 + console 全绿日志。
  - `rubric` TR-12.2: 维度=集成体验整体对齐洪恩识字；scale 1-5；锚点 1=大量脱节 3=可用但粗糙 5=流畅自然高度一致；阈值 ≥ 4；证据=完成 LearnModule "大" 字完整 5 步学习流录像或详细观察记录。
- **Notes**: 此任务是最终的"打磨胶水层"，不新增内部机制，但保证所有子系统正确组合进入主应用。
