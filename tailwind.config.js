/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.js",
    "./src/**/*.html",
  ],
  theme: {
    extend: {
      // P0-1 儿童语义色板（与 style.css :root token 同源；纯增量不改现有类）
      colors: {
        kid: {
          primary: "#FF6B00",
          "primary-deep": "#E64A00",
          "primary-soft": "#FFB03A",
          joy: { green: "#4CAF50", blue: "#0288D1", purple: "#8E24AA" },
          success: "#22c55e",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
      },
      // P0-1 儿童字号刻度（正文 18px 起；汉字卡特大字号）
      fontSize: {
        "kid-body": ["18px", "1.6"],
        "kid-title": ["28px", "1.35"],
        "kid-hanzi": ["88px", "1.1"],
        "kid-hanzi-hero": ["120px", "1"],
      },
      // P0-1 触控标准：最小命中 48px
      minHeight: { "touch-min": "48px" },
      minWidth: { "touch-min": "48px" },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'cursive', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'scale-up': 'scaleUp 0.2s ease-out',
        'shake-horiz': 'shakeHoriz 0.4s ease-in-out',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'rotate-phone': 'rotatePhone 1.5s ease-in-out infinite',
        'page-flip-in-right': 'pageFlipInRight 0.4s ease-out',
        'page-flip-out-left': 'pageFlipOutLeft 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeOut: { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        scaleUp: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shakeHoriz: { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } },
        bounceSlow: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        rotatePhone: { '0%, 100%': { transform: 'rotate(0deg)' }, '50%': { transform: 'rotate(90deg)' } },
        pageFlipInRight: { '0%': { transform: 'rotateY(-90deg)', opacity: '0' }, '100%': { transform: 'rotateY(0)', opacity: '1' } },
        pageFlipOutLeft: { '0%': { transform: 'rotateY(0)', opacity: '1' }, '100%': { transform: 'rotateY(90deg)', opacity: '0' } },
      },
    },
  },
  plugins: [],
}
