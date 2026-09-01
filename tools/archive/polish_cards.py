import re

with open("src/components/CardModule.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace generic button classes with 3D tactile classes in the filter logic
content = content.replace(
    'class="filter-stage-btn px-3 py-1 rounded-full text-xs font-black transition-all ${',
    'class="filter-stage-btn px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-md ${'
)
content = content.replace(
    'this.currentStage === st.key\n                    ? "bg-amber-800 text-white shadow-md"\n                    : "bg-white text-amber-900 hover:bg-amber-100"',
    'this.currentStage === st.key\n                    ? "bg-gradient-to-b from-amber-600 to-amber-800 text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]"\n                    : "bg-gradient-to-b from-white to-amber-50 text-amber-900 border-2 border-amber-200 hover:border-amber-400"'
)

content = content.replace(
    'class="filter-status-btn px-3 py-1 rounded-full text-xs font-black transition-all ${',
    'class="filter-status-btn px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-md ${'
)
content = content.replace(
    'this.currentFilter === st.key\n                    ? "bg-amber-800 text-white shadow-md"\n                    : "bg-white text-amber-900 hover:bg-amber-100"',
    'this.currentFilter === st.key\n                    ? "bg-gradient-to-b from-amber-600 to-amber-800 text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]"\n                    : "bg-gradient-to-b from-white to-amber-50 text-amber-900 border-2 border-amber-200 hover:border-amber-400"'
)

# And radical buttons
content = content.replace(
    'class="radical-tag-btn px-2 py-1 rounded text-[10px] font-black transition-colors ${',
    'class="radical-tag-btn px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm ${'
)
content = content.replace(
    'this.selectedRadical === rad ? "bg-amber-800 text-white" : "bg-amber-100 text-amber-900 hover:bg-amber-200"',
    'this.selectedRadical === rad ? "bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-[inset_0_-2px_2px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-amber-100 to-amber-200 text-amber-900 border-2 border-amber-300 hover:border-orange-400"'
)

with open("src/components/CardModule.js", "w", encoding="utf-8") as f:
    f.write(content)

