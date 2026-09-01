import re

with open("src/components/MapModule.js", "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to replace the <header> tag completely, because the HUD is now in SharedShell.js
# We also want to add the building nodes.
# Let's just find the <header>...</header> block and replace it with nothing.
header_pattern = re.compile(r'<!-- 1\. 顶部 3D 游戏化控制栏 -->.*?</header>', re.DOTALL)
content = header_pattern.sub('', content)

# Now we find the place to insert the interactive buildings inside the map.
# We can find the "<!-- 漂浮装饰热气球与云彩 -->" and add our buildings right after it.

buildings_html = """
            <!-- 奇妙游乐场 (Play) -->
            <button class="nav-mode-pill absolute bottom-[25%] left-[800px] group flex flex-col items-center hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-20" data-mode="play">
              <div class="w-32 h-32 bg-gradient-to-tr from-purple-600 to-fuchsia-400 rounded-full flex items-center justify-center text-6xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-fuchsia-200 animate-bounce-slow" style="animation-delay: 0.2s">🎡</div>
              <div class="mt-2 bg-purple-900/80 backdrop-blur-md text-white font-black text-sm px-4 py-1.5 rounded-full border-2 border-purple-300">凯茜游乐场</div>
            </button>

            <!-- 绘本阅读岛 (Books) -->
            <button class="nav-mode-pill absolute top-[30%] left-[1200px] group flex flex-col items-center hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-20" data-mode="books">
              <div class="w-28 h-28 bg-gradient-to-tr from-green-600 to-emerald-400 rounded-full flex items-center justify-center text-5xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-emerald-200 animate-bounce-slow" style="animation-delay: 0.7s">📚</div>
              <div class="mt-2 bg-green-900/80 backdrop-blur-md text-white font-black text-sm px-4 py-1.5 rounded-full border-2 border-green-300">绘本阅读岛</div>
            </button>

            <!-- 字卡宝库 (Cards) -->
            <button class="nav-mode-pill absolute bottom-[35%] left-[1600px] group flex flex-col items-center hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] z-20" data-mode="cards">
              <div class="w-24 h-24 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center text-4xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-cyan-200 animate-bounce-slow" style="animation-delay: 1.1s">🎴</div>
              <div class="mt-2 bg-blue-900/80 backdrop-blur-md text-white font-black text-sm px-4 py-1.5 rounded-full border-2 border-cyan-300">字卡宝库</div>
            </button>
"""

content = content.replace('<!-- 漂浮装饰热气球与云彩 -->', '<!-- 漂浮装饰热气球与云彩 -->\n' + buildings_html)

# Also remove the "nav-mode-pill" setup from bindEvents() that expects them to be in the header? No, the class is the same!
# So the existing Javascript `this.container.querySelectorAll(".nav-mode-pill").forEach` will automatically attach to our new buildings!

with open("src/components/MapModule.js", "w", encoding="utf-8") as f:
    f.write(content)
