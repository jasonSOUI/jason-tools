import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/tools/', 
  server: {
    host: '0.0.0.0',           // 如果希望對外也能訪問（選用）
    port: 5173,                // 根據您的 port
    allowedHosts: ['www.soui.com.tw'],
  }
})
