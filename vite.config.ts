
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // تحميل المتغيرات من ملف .env أو من إعدادات Netlify
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // حقن المتغيرات في الكود المجمع ليتمكن المتصفح من الوصول إليها
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || ""),
        'process.env.VITE_DATABASE_URL': JSON.stringify(env.VITE_DATABASE_URL || ""),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      }
    };
});
