import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'ffmpeg-static',
        'fluent-ffmpeg',
        '@distube/ytdl-core',
        'ytdl-core-discord'
      ]
    }
  },
});
