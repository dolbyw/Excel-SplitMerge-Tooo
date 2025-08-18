import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/preload.ts'),
      name: 'preload',
      fileName: 'preload',
      formats: ['cjs']
    },
    outDir: 'dist',  // 确保输出到dist目录
    emptyOutDir: false,
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'cjs',
        entryFileNames: 'preload.js'  // 确保文件名为preload.js
      }
    },
    target: 'node14'
  }
})