import { defineConfig } from 'vitest/config'
export default defineConfig({
  css: {
    postcss: false
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    // threads：每个测试文件独立 worker 线程
    // 天然隔离 global document / window / localStorage 等全局对象
    // 之前 singleFork:true 把所有测试塞进同一个进程 → 全局污染
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
  },
})
