#!/usr/bin/env bash
# ============================================================
# 凯茜识字 · 《洪恩识字》音频引擎 1:1 深度克隆
# 真机手工烟雾测试 · 2 分钟一键复现脚本
# 适用环境：macOS + Chrome + Node v18+
#
# 用法：
#   chmod +x tools/run-smoke-test.sh
#   ./tools/run-smoke-test.sh            # 一键跑完 (推荐)
#   ./tools/run-smoke-test.sh --verbose  # 输出每一步 debug 信息
#   ./tools/run-smoke-test.sh --kill     # 仅清理上一次残留进程并退出
#
# 产物：
#   .trae/specs/ihuman-audio-engine-clone/smoke-test/smoke-test-result.json
#   .trae/specs/ihuman-audio-engine-clone/smoke-test/smoke-test-report.md
# ============================================================
set -uo pipefail
PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"

VERBOSE=0
KILL_ONLY=0
for a in "$@"; do
  case "$a" in
    --verbose|-v)  VERBOSE=1 ;;
    --kill|-k)     KILL_ONLY=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "❌ 未知参数：$a"; exit 2 ;;
  esac
done

log()   { printf "  \033[1;34m…\033[0m %s\n" "$*"; }
ok()    { printf "  \033[1;32m✔\033[0m %s\n" "$*"; }
warn()  { printf "  \033[1;33m⚠\033[0m %s\n" "$*"; }
err()   { printf "  \033[1;31m✖\033[0m %s\n" "$*"; }
hr()    { printf "\n%0.s─" $(seq 1 60); echo; }

# 超时 + 进程清理器
declare -a _PIDS=() || true
_PIDS=()
_cleanup() {
  local ec=$?
  trap - EXIT INT TERM 2>/dev/null || true
  printf "\n"
  warn "清理所有子进程 (${#_PIDS[@]} 项)…"
  for p in "${_PIDS[@]+"${_PIDS[@]}"}"; do
    [ -n "$p" ] && kill -9 "$p" 2>/dev/null || true
  done
  sleep 0.3
  # 额外扫尾：占用 8765 / 8766 / 9222 的孤儿进程
  pkill -9 -f "http.server 8765" 2>/dev/null || true
  pkill -9 -f "voice-server.mjs" 2>/dev/null || true
  pkill -9 -f "remote-debugging-port=9222.*chrome-debug-smoke" 2>/dev/null || true
  [ $ec -eq 0 ] && ok "退出码 0 · 复现完毕 🎉" || err "退出码 $ec · 失败（详见上方日志）"
  exit $ec
}
trap _cleanup EXIT INT TERM

START_TS=$(date +%s)

echo
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  凯茜识字 洪恩音频引擎 1:1 克隆 · 烟雾测试一键复现      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo "  项目目录   : $PROJ_DIR"
echo "  开始时间   : $(date '+%Y-%m-%d %H:%M:%S')"
echo

# ============================================================
# [KILL-ONLY] 清理模式
# ============================================================
if [ "$KILL_ONLY" -eq 1 ]; then
  warn "--kill 模式：仅清理 8765/8766/9222 残留并退出"
  pkill -9 -f "http.server 8765" 2>/dev/null || true
  pkill -9 -f "voice-server.mjs" 2>/dev/null || true
  pkill -9 -f "remote-debugging-port=9222.*chrome-debug-smoke" 2>/dev/null || true
  ok "清理完成"
  exit 0
fi

# ============================================================
# Step 1 · 前置依赖检查（<5s）
# ============================================================
hr
echo "  [1/4] 🔍 前置依赖检查"
DEP_FAIL=0
check_cmd() {
  local name=$1 cmd=$2
  if ! command -v "$cmd" &>/dev/null; then
    err "缺少 $name ($cmd)"
    DEP_FAIL=1
  else
    [ $VERBOSE -eq 1 ] && ok "$name OK: $($cmd --version 2>/dev/null | head -1 || $cmd -v 2>/dev/null | head -1)"
  fi
}
check_cmd "Node.js" node
check_cmd "python3" python3
check_cmd "Google Chrome" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -f "tools/_smoke_test_runner.mjs" ]; then
  err "找不到 runner：tools/_smoke_test_runner.mjs"
  DEP_FAIL=1
fi
if [ ! -f "_audio_ac_runner.html" ]; then
  err "找不到 AC 验收台：_audio_ac_runner.html"
  DEP_FAIL=1
fi
if [ "$DEP_FAIL" -eq 1 ]; then
  err "前置依赖不满足，请安装后重跑。"
  exit 1
fi
ok "依赖全部就绪 ✅"

# ============================================================
# Step 2 · 清理占用 + 启动 HTTP 服务（端口 8765）
# ============================================================
hr
echo "  [2/4] 🌐 启动本地 HTTP 服务 (端口 8765)"
OLD_8765=$(lsof -ti:8765 -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$OLD_8765" ]; then
  warn "8765 端口旧进程: $OLD_8765 → 清理"
  kill -9 $OLD_8765 2>/dev/null || true
  sleep 0.5
fi
(python3 -m http.server 8765 >/tmp/cathy-smoke-http.log 2>&1) &
HTTP_PID=$!
_PIDS+=("$HTTP_PID")
sleep 1.2
# 健康检查 5 次
for i in 1 2 3 4 5; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8765/_audio_ac_runner.html || true)
  [ "$HTTP_CODE" = "200" ] && break
  warn "HTTP 健康检查 #$i = $HTTP_CODE · 再等 1s"
  sleep 1
done
if [ "$HTTP_CODE" != "200" ]; then
  err "HTTP 服务 5s 内未就绪。日志："; cat /tmp/cathy-smoke-http.log; exit 1
fi
ok "HTTP 服务正常 PID=$HTTP_PID · HTTP $HTTP_CODE"

# ============================================================
# Step 2b · 启动神经童声代理服务 (端口 8766, 晓依真人级童声)
# ============================================================
hr
echo "  [2b/4] 🎤 启动神经童声代理 (端口 8766)"
OLD_8766=$(lsof -ti:8766 -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$OLD_8766" ]; then
  warn "8766 端口旧进程: $OLD_8766 → 清理"
  kill -9 $OLD_8766 2>/dev/null || true
  sleep 0.5
fi
(node tools/voice-server.mjs >/tmp/cathy-smoke-voice.log 2>&1) &
VOICE_PID=$!
_PIDS+=("$VOICE_PID")
sleep 1.5
VOICE_STATUS="off"
for i in 1 2 3 4 5 6; do
  VOICE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8766/health || true)
  [ "$VOICE_CODE" = "200" ] && break
  warn "voice-server 健康检查 #$i = $VOICE_CODE · 再等 1.5s"
  sleep 1.5
done
if [ "$VOICE_CODE" = "200" ]; then
  VOICE_STATUS="on"
  CACHED=$(curl -s http://127.0.0.1:8766/health | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["cache"]["files"])' 2>/dev/null || echo "?")
  ok "神经童声服务正常 PID=$VOICE_PID · 已缓存 $CACHED 条 (晓依 48kHz)"
else
  warn "voice-server 未就绪 (烟雾测试仍可跑, 语音走系统 TTS 降级)。日志："
  head -5 /tmp/cathy-smoke-voice.log
fi

# ============================================================
# Step 3 · 启动 Chrome CDP（端口 9222）远程调试模式
# ============================================================
hr
echo "  [3/4] 🌐 启动 Chrome CDP 远程调试 (端口 9222)"
OLD_9222=$(lsof -ti:9222 -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$OLD_9222" ]; then
  warn "9222 端口旧进程: $OLD_9222 → 清理"
  kill -9 $OLD_9222 2>/dev/null || true
  sleep 0.5
fi
rm -rf /tmp/chrome-debug-smoke 2>/dev/null || true
mkdir -p /tmp/chrome-debug-smoke
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
( "$CHROME_BIN" \
    --remote-debugging-port=9222 \
    --remote-debugging-address=127.0.0.1 \
    --user-data-dir=/tmp/chrome-debug-smoke \
    --no-first-run \
    --no-default-browser-check \
    --disable-popup-blocking \
    about:blank >/tmp/cathy-smoke-chrome.log 2>&1 ) &
CHROME_PID=$!
_PIDS+=("$CHROME_PID")
sleep 2.5
# 健康检查 5 次
for i in 1 2 3 4 5; do
  CDP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9222/json/version || true)
  [ "$CDP_CODE" = "200" ] && break
  warn "CDP 健康检查 #$i = $CDP_CODE · 再等 1.5s"
  sleep 1.5
done
if [ "$CDP_CODE" != "200" ]; then
  err "Chrome CDP 未就绪。日志 (前 15 行)："; head -15 /tmp/cathy-smoke-chrome.log; exit 1
fi
CDP_VER=$(curl -s http://127.0.0.1:9222/json/version | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d.get("Browser","?")+" · JS="+d.get("Js-Version","?"))' 2>/dev/null || echo "unknown")
ok "Chrome CDP 正常 PID=$CHROME_PID · HTTP $CDP_CODE · $CDP_VER"

# ============================================================
# Step 4 · 运行 smoke test runner (核心 ~60s)
# ============================================================
hr
echo "  [4/4] 🧪 执行 12 项 AC 验收烟雾测试 runner"
log "→ node tools/_smoke_test_runner.mjs"
RUN_LOG="/tmp/cathy-smoke-runner.log"
set +e
(node tools/_smoke_test_runner.mjs 2>&1 | tee "$RUN_LOG")
RUN_RC=${PIPESTATUS[0]}
set -e
hr

# ============================================================
# 结果解析 & 归档
# ============================================================
RESULT_JSON=".trae/specs/ihuman-audio-engine-clone/smoke-test/smoke-test-result.json"
END_TS=$(date +%s)
ELAPSED=$((END_TS - START_TS))
M=$((ELAPSED / 60))
S=$((ELAPSED % 60))

if [ "$RUN_RC" -ne 0 ]; then
  err "Runner 非零退出 $RUN_RC · 运行时长 ${M}m${S}s"
  warn "最后 20 行日志："
  tail -20 "$RUN_LOG" | sed 's/^/       /'
  exit 1
fi

# 解析 JSON 摘要
if [ -f "$RESULT_JSON" ]; then
  PASS_N=$(python3 -c 'import json,sys;d=json.load(open(sys.argv[1]));print(d["summary"]["header"]["pass"])' "$RESULT_JSON" 2>/dev/null || echo "?")
  FAIL_N=$(python3 -c 'import json,sys;d=json.load(open(sys.argv[1]));print(d["summary"]["header"]["fail"])' "$RESULT_JSON" 2>/dev/null || echo "?")
  RATE=$(python3 -c 'import json,sys;d=json.load(open(sys.argv[1]));print(d["summary"]["header"]["rate"])' "$RESULT_JSON" 2>/dev/null || echo "?")
  HASH=$(shasum -a 256 "$RESULT_JSON" | cut -d' ' -f1)
else
  PASS_N="?"; FAIL_N="?"; RATE="?"; HASH="缺失"
fi

hr
echo
echo "  ┌─────────────────────────────────────────────────────┐"
printf "  │  \033[1;37m 凯茜识字 · 洪恩音频引擎 烟雾测试结果 \033[0m              │\n"
echo "  ├─────────────────────────────────────────────────────┤"
printf "  │   PASS  %-5s   FAIL  %-5s   RATE  %-7s       │\n" "$PASS_N" "$FAIL_N" "$RATE"
printf "  │   总耗时 %2dm %02ds   神经童声 %-12s      │\n" "$M" "$S" "$VOICE_STATUS"
printf "  │   证据哈希 %-38.38s  │\n" "$HASH"
echo "  └─────────────────────────────────────────────────────┘"
echo
echo "  📄 JSON 结果 : $RESULT_JSON"
echo "  📄 报告路径  : .trae/specs/ihuman-audio-engine-clone/smoke-test/smoke-test-report.md"
echo

if [ "$PASS_N" = "12" ] && [ "$FAIL_N" = "0" ]; then
  ok "✅ 12/12 验收项 100% 通过 · 可复现成功！"
  exit 0
else
  warn "⚠️  未达到 12/12 全绿，当前 PASS=$PASS_N FAIL=$FAIL_N"
  warn "请查看 $RUN_LOG 末段或执行：\n      cd \"$PROJ_DIR\" && tail -40 $RUN_LOG"
  exit 2
fi
