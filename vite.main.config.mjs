import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'electron-updater',
        'ffmpeg-static',
        'fluent-ffmpeg',
        'yt-dlp-exec'
      ]
    }
  },
});
