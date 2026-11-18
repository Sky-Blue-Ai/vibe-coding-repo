import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/vibe-coding-repo/',
  plugins: [react(), tailwindcss()],
})
