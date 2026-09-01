import re

with open("src/utils/playSceneEngine.js", "r", encoding="utf-8") as f:
    content = f.read()

# Fire (火) Enhancements: Add ambient embers
old_fire_bg = '<div class="relative w-full h-full bg-slate-900 overflow-hidden select-none touch-none flex flex-col items-center justify-center">'
new_fire_bg = """<div class="relative w-full h-full bg-slate-900 overflow-hidden select-none touch-none flex flex-col items-center justify-center">
        <!-- Ambient Embers -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="ember absolute left-[20%] bottom-[30%] w-2 h-2 bg-orange-400 rounded-full" style="animation-delay: 0s"></div>
          <div class="ember absolute left-[50%] bottom-[20%] w-3 h-3 bg-red-400 rounded-full" style="animation-delay: 1.2s"></div>
          <div class="ember absolute left-[80%] bottom-[40%] w-2 h-2 bg-yellow-400 rounded-full" style="animation-delay: 0.5s"></div>
          <div class="ember absolute left-[35%] bottom-[10%] w-1.5 h-1.5 bg-orange-300 rounded-full" style="animation-delay: 2.1s"></div>
        </div>"""
content = content.replace(old_fire_bg, new_fire_bg)


# Water (水) Enhancements: Add water-wobble to balloon
old_water_balloon = 'id="water-balloon" class="w-24 h-24 bg-gradient-to-br from-blue-300 to-blue-600 rounded-[100%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2),0_10px_20px_rgba(37,99,235,0.5)] border-4 border-blue-400 cursor-s-resize flex items-center justify-center text-4xl overflow-hidden relative"'
new_water_balloon = 'id="water-balloon" class="water-wobble w-24 h-24 bg-gradient-to-br from-blue-300 to-blue-500 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2),0_10px_30px_rgba(37,99,235,0.6)] border-4 border-blue-200 cursor-s-resize flex items-center justify-center text-4xl overflow-hidden relative"'
content = content.replace(old_water_balloon, new_water_balloon)

# Moon (月) Enhancements: Slow moving clouds
old_moon_bg = '<div class="relative w-full h-full bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 overflow-hidden select-none touch-none flex flex-col items-center">'
new_moon_bg = """<div class="relative w-full h-full bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-900 overflow-hidden select-none touch-none flex flex-col items-center">
        <!-- Ambient Clouds -->
        <div class="absolute inset-0 pointer-events-none opacity-20">
           <div class="absolute top-10 left-[-20%] w-64 h-20 bg-white rounded-full blur-2xl animate-[floatRight_20s_linear_infinite]"></div>
           <div class="absolute top-40 left-[-50%] w-80 h-24 bg-white rounded-full blur-3xl animate-[floatRight_35s_linear_infinite]" style="animation-delay: -10s"></div>
        </div>"""
content = content.replace(old_moon_bg, new_moon_bg)

with open("src/utils/playSceneEngine.js", "w", encoding="utf-8") as f:
    f.write(content)
