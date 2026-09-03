import { defineConfig } from 'vitest/config'
export default defineConfig({
  css: {
    postcss: false
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    // singleFork：所有测试同进程串行，共享模块缓存 —— 字库详情层(2.8MB)只 transform 一次
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
})
