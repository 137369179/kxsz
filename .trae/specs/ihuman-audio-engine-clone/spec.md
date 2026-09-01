# 洪恩识字音频引擎 1:1 机制级与声学级深度克隆 - Product Requirements Document

## Overview
- **Summary**: 在现有 [soundEngine.js](file:///Users/mac/Desktop/识字/src/utils/soundEngine.js) 基础上，构建对《洪恩识字》(iHuman Chinese) 音频引擎的机制级（路由/状态/优先级/调度）与声学级（音素精度/韵律/童声特征/跟读评测）双维度 1:1 深度克隆。
- **Purpose**: 使凯茜识字项目具备与洪恩识字同级别的音频教学体验：精准的汉字发音、智能韵律、甜美的伴学童声、实时跟读评测反馈、笔顺-语音严格同步，以及儿童友好的情绪表达。
- **Target Users**: 3–8 岁儿童用户（听力学习者 + 跟读练习者），以及家长与教研审核者。

## Goals
- **G-1 机制级全覆盖**: 四级总线 / 智能闪避 / 队列调度 / 场景 BGM / 声像 / 复音池 六类机制与洪恩机制行为曲线参数误差 ≤ 10%。
- **G-2 声学级童声拟合**: 生成甜美童声音色，音素时长、基频曲线、四声声调轨迹、儿化与轻声参数拟合度主观 MOS ≥ 4.0/5.0。
- **G-3 汉字发音精准**: 支持 GB 常用字多音字上下文消歧 + 连读变调（上上相连、一不变调、不啊变音），单字发音正确率 rule = 100%。
- **G-4 跟读评测闭环**: 通过 Web Speech API 实现实时收音 → 音素对齐 → 发音打分（准确度/流利度/完整度）→ 语音纠错引导的完整链路。
- **G-5 笔顺语音同步**: 汉字笔顺每一笔的起/停点与语音/音效帧级对齐，误差 ≤ 1 帧 (16ms)。
- **G-6 情绪与场景表达**: 鼓励/纠正/引导三类情绪语气各 ≥ 3 种语音形态区分度可识别；儿歌/律动合成可在浏览器实时播放。

## Non-Goals
- **NG-1**: 不构建或训练自定义神经网络 TTS 模型（不运行本地 PyTorch/TensorFlow）；所有声学克隆在浏览器 Web Audio API + Web Speech API 范围内完成。
- **NG-2**: 不录制/分发洪恩原声音频资源；所有 SFX 通过程序化合成或用户自带素材加载。
- **NG-3**: 不实现跨平台移动端原生音频引擎（iOS AVAudioEngine / Android AudioTrack）；范围限定在 Web 运行时 (Chromium / Safari / Firefox)。
- **NG-4**: 不做儿童声纹识别或身份认证生物特征采集。
- **NG-5**: 不做离线 PWA 音频资源包预下载管理（已在 sw.js 覆盖的全局缓存策略内）。

## Background & Context
1. 现有 [soundEngine.js](file:///Users/mac/Desktop/识字/src/utils/soundEngine.js#L13-L875) 已实现 CathyAudioEngine 基类 18 项 SFX + 三轨 BGM + 基本 `speak()` 封装，但存在以下与洪恩级差距：
   - `speak()` 直接使用 `SpeechSynthesisUtterance` pitch=1.35 全局硬编码，无 **音素级时长/基频/共振峰精细控制**；
   - 无 **多音字 G2P 消歧表** 与 **连读变调规则引擎**；
   - 无 **语音识别跟读评测 ASR 链路**；
   - 无 **笔顺语音帧同步控制器**；
   - 情绪、韵律、节奏全部交给系统 TTS 默认行为。
2. 洪恩识字公开产品特征（来源于 [产品介绍页](https://www.pchome.net/games/607090.html)、[练字笔 AI 语音纠错 23 维评测](https://detail.youzan.com/show/shopnote/detail?alias=u36iUlsUQt)）：
   - "认-读-练-写-用" 五步教学法每步有专属声音策略；
   - 实时 AI 语音识别纠错纠正发音；
   - 独创 "汉字变形记" 视觉记忆 + 专属情景配音；
   - 儿歌律动教学提升语音敏感度；
   - 家长可录制专属语音提示，让孩子听到父母声音。
3. TTS 完整链路参考 [TTS 技术百科](https://cloud.tencent.com/developer/techpedia/1243/19588)：文本前端 → 韵律建模 → 声学模型 → 声码器。浏览器端 `speechSynthesis` 承担 "声学模型+声码器" 职责，本项目在其上方构建 **文本前端 + 韵律控制 + 童声后处理 DSP + ASR 评测** 四层，形成机制级+声学级完整克隆。

## Functional Requirements

### FR-1 四级混音总线 + 子通道优先级调度
- Master / BGM / Voice / SFX 四级 GainNode 架构；
- Voice 子通道细分：`voice_char`（单字朗读）/ `voice_word`（词组）/ `voice_sentence`（句子）/ `voice_tutor`（伴学引导）/ `voice_eval`（评测反馈），五级优先级队列；
- 高优先级（`voice_tutor`、`voice_eval`）可打断低优先级，已打断语音入 resume 栈；

### FR-2 智能音频闪避 (Audio Ducking) 多策略
- 策略 A `char_duck`: BGM 压低至 15%（-16.5dB），attack 80ms，release 300ms；
- 策略 B `tutor_duck`: BGM 压低至 25%（-12dB），SFX 压低至 60%；
- 策略 C `eval_duck`: BGM 完全静音 0%，SFX 30%，保证 ASR 收音质量；
- 闪避嵌套：内层策略触发时外层不重复调度，栈式 push/pop 恢复；

### FR-3 文本前端 (G2P Frontend) 汉字→拼音精确转换
- 常用字 1300+ 多音字消歧规则表（上下文 POS / 词典双判定）；
- 支持轻声、儿化、`一/七/八/不` 变调、上上相连变阳平、`啊` 音变 6 类变调规则；
- 输出格式：`{char, pinyin, initial, final, tone_number, tone_sandhi_applied, duration_ms, stress_level}`；

### FR-4 声学级童声 4 声调轨迹拟合 + 共振峰 DSP
- 在 `playToneSlide` 基础上升级为 **音素级 Pitch 包络器**：
  - 阴平 55：基频 F0 520Hz ± 15Hz 水平；
  - 阳平 35：340 → 540Hz，对数曲线斜率 0.92；
  - 上声 214：360 → 220 → 460Hz，谷点在 36% 处；
  - 去声 51：560 → 200Hz，衰减系数 0.45；
- 童声共振峰后处理链：Biquad LowShelf +2dB @ 350Hz (F1 强化)、HighShelf +3dB @ 3.2kHz (F2 提亮)、Peaking +1.5dB Q=1.4 @ 2.8kHz (童声"明亮"峰)；

### FR-5 汉字单字 / 词组 / 句子 三档朗读模式
- `speakCharacter(char, options)`：逐字发音，默认 450ms 音节 + 25ms 尾静音；
- `speakWord(word, options)`：词内重音模式（末字轻声、动宾重前、偏正重后）自动套用；
- `speakSentence(text, options)`：句间标点停顿矩阵（顿号 80ms / 逗号 180ms / 分号 260ms / 句号 420ms / 问号 380ms 升调）；
- 每一级都支持 `repeatCount` / `mode: standard | slow | karaoke`；

### FR-6 实时跟读评测 (Pronunciation Assessment)
- 基于 `webkitSpeechRecognition` / `SpeechRecognition` 实时 STT；
- 预期文本 vs 识别文本音素对齐（Levenshtein + Pinyin 归一化）；
- 三维度打分：准确度 Pronunciation Accuracy (PA)、流利度 Speech Rate (SR)、完整度 Completeness (CM)；
- 错音定位到单字 → 触发 `voice_eval` 纠错引导语 "小嘴巴再试试看，这个音调应该是第二声哦～"；
- 评分 0-100，映射 Good / Great / Perfect 三档奖励音；

### FR-7 笔顺-语音帧级同步控制器 (Stroke-Voice Sync)
- 与 [HanziEngine](file:///Users/mac/Desktop/识字/src/utils/hanziEngine.js) 笔顺渲染器对接 `stroke.start` / `stroke.end` 事件；
- 每一笔 start → 触发毛笔宣纸 `playStrokeSound(pan)`；
- 每一笔 end → 触发笔画名称语音 "横 / 竖 / 撇 / 捺 / 点 / 折 / 钩 / 提"（8 种基础笔画语音）；
- 帧级时间戳对齐：使用 `audioCtx.currentTime` 作为全局时钟源，不使用 setTimeout；

### FR-8 情绪化童声韵律控制
- 情绪向量集 `emotion = {joy, encouragement, correction, mystery, warmth, victory}`；
- 每种情绪对应 Pitch 偏移、语速 Rate、音量 Gain、句尾调形 4 个参数的偏差矩阵；
- 鼓励语音鼓励词库 12 条随机 + 情感参数抖动（Jitter ±5%）避免机械重复感；

### FR-9 程序化 BGM 场景扩展 (6+ 场景)
- 现有 map / learn / arcade 升级，新增 story（故事绘本）、review（复习沉想）、battle（怪兽对战）、victory（过关乐章）、night（夜间柔版）；
- 每种场景独有和声进行、波形组合（triangle/sine/sawtooth 比例）、Tempo BPM、Dynamic Range Compressor Threshold；
- BGM 交叉淡入淡出：旧场景 600ms fade-out，新场景 600ms fade-in，overlap 200ms；

### FR-10 儿歌 / 律动合成引擎 (Kids Chant Synthesizer)
- "三字三字经" 节奏模板：四分 / 八分 / 附点组合；
- 旋律模板：C 大调五声音阶 1-2-3-5-6；
- 鼓机底鼓 + 木鱼打击合成；
- 预载 5 首常用识字儿歌：《上山打老虎》、《数鸭子》、《拍手歌》等 10 秒片段；

### FR-11 家长语音录制与回放 (Parent Voice Mode)
- 使用 `MediaRecorder` API 录制 ≤ 30 秒 WAV 片段；
- 保存至 IndexedDB `parent_voice_store`；
- 可替换 6 类关键触发点：开始学习 / 完成学习 / 写错提醒 / 写对奖励 / 复习开启 / 护眼提醒；

### FR-12 音量与静音持久化 + 家长锁
- 4 条音量 + 静音设置存入 `localStorage`（key = `cathy_audio_profile_v1`）；
- 家长锁：连续长按音量键 3s 触发解锁面板，防止孩子误操作；
- 耳机/外放自动检测：`navigator.mediaDevices.addEventListener('devicechange')` 插入耳机自动降到 70% 音量保护听力；

## Non-Functional Requirements
- **NFR-1 低延迟**: 按钮点击到 SFX 起音延迟 ≤ 30ms（95 百分位）；单字朗读触发到 TTS 第一个音素起音 ≤ 200ms；
- **NFR-2 高并发复音**: 瞬时并发 32 音不爆音、不裁剪，总增益 ≤ 0.999（DynamicsCompressor 限幅）；
- **NFR-3 内存安全**: 所有 OscillatorNode / BufferSource 在 `onended` 后自动 disconnect 与 deref，连续运行 2h 无 OOM；
- **NFR-4 浏览器兼容性**: Chrome 120+、Safari 17+、Firefox 124+ 全部通过基础 AC；
- **NFR-5 可访问性**: 所有语音均有字幕回显（WebVTT 风格），听力障碍儿童可通过文本替代；
- **NFR-6 声学安全**: 峰值声压 ≤ 85dB（模拟真人儿童耳机），持续曝光 1h 不触发听力疲劳预警（基于 ITU-R BS.1770-4 Loudness 算法）；
- **NFR-7 可观测性**: 暴露 `window.CathyAudioEngine.debugPanel()` 输出总线状态、队列深度、闪避栈、F0 实时轨迹、节点数；

## Constraints
- **Technical**:
  - 仅运行于现代浏览器环境（Web Audio API / Web Speech API / IndexedDB / MediaRecorder）；
  - 不可加载 > 5MB 的第三方音频资源库；
  - 必须与现有 EventBus（[eventBus.js](file:///Users/mac/Desktop/识字/src/utils/eventBus.js)）兼容，对外事件命名遵循 `EVENTS.AUDIO_*` 前缀；
- **Business**:
  - 整体音频体验对标洪恩识字（非法律意义上的像素级精确复刻，而是产品行为与教学效果对齐）；
  - 教育效果：家长和孩子主观听感与洪恩产品可比；
- **Dependencies**:
  - 依赖浏览器端 `speechSynthesis` 提供中文语音合成能力；
  - 依赖 `webkitSpeechRecognition`（仅 Chromium）提供跟读评测 STT 能力，Safari 下降级为手动打分。

## Assumptions
- **A-1**: Chromium 内核浏览器（Chrome、Edge、360 Chrome 内核）是目标用户群的主力，普及率 ≥ 85%；
- **A-2**: 用户设备麦克风收音信噪比 ≥ 20dB，可提供可用 ASR 输入；
- **A-3**: 多音字消歧规则表可从通用中文 G2P 规则子集构建，无需 ML 模型；
- **A-4**: 系统 TTS `zh-CN` 音色在 pitch=1.2~1.5 区间可模拟童声质感，配合共振峰 DSP 可达到主观识别。

## Acceptance Criteria

### AC-1: 四级混音总线与优先级队列行为正确
- **Type**: `rule`
- **Given**: 音频引擎已 init，BGM `learn` 场景正在播放
- **When**: 依次触发 `speakWord`（priority-3）→ 然后立即触发 `speakTutor`（priority-1）→ 然后触发 `playPop`（SFX priority-2）
- **Then**: (a) tutor 立即打断 word 并开始播放；(b) BGM 执行 tutor_duck 策略；(c) pop SFX 在 tutor 播放同时以 ducked 音量叠加；(d) tutor 结束后 word 从断点 resume；(e) BGM 在最内层 duck 弹栈后才恢复
- **Pass Condition**: 在开发者控制台执行 `run_AC_1_scenario()` 返回 `{interruptOk: true, duckOrderOk: true, resumeOk: true}` 全部 true
- **Evidence**: 自动化脚本执行结果 + audioCtx 节点连接树 dump

### AC-2: 多音字上下文消歧正确率
- **Type**: `rule`
- **Given**: G2P 前端已加载
- **When**: 输入测试集 30 组多音字（银行/行走、重要/重复、音乐/快乐、好人/爱好、一/一 个/不/不是 等）
- **Then**: 30/30 组拼音声调全部正确，包括连读变调产物
- **Pass Condition**: `G2P.testSuite().accuracy === 1.0`
- **Evidence**: 测试脚本断言输出记录

### AC-3: 汉语四声声调轨迹拟合误差
- **Type**: `rule`
- **Given**: 播放 character "妈麻马骂" 四个单字
- **When**: 在 Pitch 包络器 hook 中采样 100 点 F0 曲线并与标准轨迹比较
- **Then**: 每个音节的 F0 DTW 距离 ≤ 阈值（阴平 ≤ 8Hz、阳平 ≤ 14Hz、上声 ≤ 18Hz、去声 ≤ 12Hz）
- **Pass Condition**: 4 音节 DTW 全部在阈值内
- **Evidence**: `toneSlideValidator.report()` JSON 输出

### AC-4: 童声音色主观自然度
- **Type**: `rubric`
- **Dimension**: 童声音色与洪恩级自然度相似度
- **Scale**: 1-5
- **Anchors**: 1 = 明显机械感，与洪恩差距极大；3 = 可识别为"儿童方向"但仍有机器人感；5 = 甜美的儿童伴学音色，几乎无法与真人区分
- **Pass Threshold**: >= 4
- **Evidence**: 至少 3 位评审（家庭成员/用户反馈面板）盲测 10 段样例音频打分均值 ≥ 4.0，或单人开发者内评 + 对比参考录音达到 4+

### AC-5: 跟读评测闭环可运行
- **Type**: `rule`
- **Given**: 用户授权麦克风权限，在 Chromium 环境
- **When**: (a) 点击跟读按钮 (b) 系统播放标准音 (c) 用户录音说 "大" (d) 3 秒内输出评分
- **Then**: (a) 录音期间 BGM 静音；(b) 评分区间 [0, 100]；(c) 评分后根据得分触发对应 combo 音效或纠错引导语；(d) 错字情况会被高亮并播放特定纠错语音
- **Pass Condition**: 连续 5 次跟读均在 4s 内返回合法评分且状态机无死锁
- **Evidence**: 浏览器 console 评测链路日志 + 录音波形截图

### AC-6: 笔顺事件与语音严格同步
- **Type**: `rule`
- **Given**: HanziEngine 正在渲染 "大" 的笔顺 (3 画: 横、撇、捺)
- **When**: 捕获 `stroke.start` / `stroke.end` DOMHighResTimeStamp 与对应 AudioNode startTime
- **Then**: 每一对事件时间差 ≤ 16ms（单帧）；3 笔全部达标
- **Pass Condition**: `StrokeSyncValidator.run("大").allFramesPass === true`
- **Evidence**: 同步打点日志时间戳比对表

### AC-7: 6 场景 BGM 切换交叉淡入淡出无爆音
- **Type**: `rule`
- **Given**: 音频引擎在任意场景 BGM 播放中
- **When**: 连续快速切换 6 种 BGM（间隔 ≤ 500ms）
- **Then**: (a) 无爆音（峰值 sample 不超过 FS±1.0）；(b) 场景间音量曲线平滑（一阶差分 > -3dB/10ms）；(c) 切换完成后旧 BGM 定时器全部清除
- **Pass Condition**: `BgmSwitchStressTest(100).glitchCount === 0 && bgmTimerCount === 1`
- **Evidence**: 压测脚本 100 轮报告

### AC-8: 情绪语气可辨识度
- **Type**: `rubric`
- **Dimension**: 情绪语气在 6 类间的主观可辨识度
- **Scale**: 1-5
- **Anchors**: 1 = 所有情绪语气听不出区别；3 = 鼓励和纠正能区分但其它混淆；5 = 6 类情绪均可明确感知差异且自然不做作
- **Pass Threshold**: >= 4
- **Evidence**: 情感混淆矩阵分类准确率 ≥ 75%（至少 3 人 × 6 类 × 3 样本）

### AC-9: 内存与节点泄漏安全
- **Type**: `rule`
- **Given**: 打开应用，压测 2 小时内重复 10000 次 SFX + 500 次 speak + 200 次 BGM 切换
- **When**: 观察 `performance.memory.usedJSHeapSize` 与 `audioCtx._nodeCount`
- **Then**: 增长斜率 ≤ 2KB/1000 次 SFX；节点数在 GC 后回归基线 ± 2%
- **Pass Condition**: `MemoryLeakProbe(2h).leakRateBelowThreshold === true`
- **Evidence**: 压测前后 Heap Snapshot 对比

### AC-10: 家长语音录制-存储-回放链路
- **Type**: `rule`
- **Given**: 用户授予麦克风权限
- **When**: 在护眼提醒触发点录制家长语音 10 秒
- **Then**: (a) IndexedDB 中存在 `parent_voice_store` 记录；(b) 下次护眼提醒触发时播放录制语音；(c) 清除数据后回退到默认 TTS 语音
- **Pass Condition**: 录制 → 刷新页面 → 触发事件 三部曲全部按预期执行
- **Evidence**: IndexedDB 检查工具记录 + 实际播放回调栈

### AC-11: 儿歌律动合成引擎输出
- **Type**: `rule`
- **Given**: 调用 `chantEngine.play("123")`
- **When**: 检查输出 AudioNode 图
- **Then**: (a) 包含旋律 OscillatorNodes ≥ 4 个；(b) 包含木鱼底鼓打击节点；(c) 输出在 8 秒内完成完整乐句循环
- **Pass Condition**: Chant graph validator 检查通过
- **Evidence**: AudioNode 连接图 dump + 渲染波形截图

### AC-12: 耳机检测自动降音量
- **Type**: `rule`
- **Given**: 当前主音量 1.0，未插耳机
- **When**: 模拟 devicechange 事件（或用户手动触发检测）显示耳机已接入
- **Then**: 主音量自动变为 0.7，且 UI 中静音按钮旁出现 "🎧" 图标提示
- **Pass Condition**: Volume value === 0.7 && DOM 中耳机图标存在
- **Evidence**: 手动操作 + DOM 快照

## Open Questions
- [ ] **Q-1**: 是否需要在 Safari（无 ASR 支持）下降级为手动评分模式 3 星点击替代，还是隐藏跟读功能？→ 默认手动打分 + 明确状态标签
- [ ] **Q-2**: 是否内置实际的常用字 G2P 表 1300+ 字，还是先支持 characters.js 中已有约 200 字？→ 先完整覆盖 characters.js 字表 + 常用多音字规则，后续增量
- [ ] **Q-3**: 家长语音录制功能是否需要上传/跨设备同步？→ 否，本地 IndexedDB 即可，符合隐私合规最小化
- [ ] **Q-4**: 是否需要为海外用户提供英文语音模式？→ 否，NG-3 内声明排除
