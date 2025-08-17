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
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js'
      }
    },
    target: 'node14'
  }
})