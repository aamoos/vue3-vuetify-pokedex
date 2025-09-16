import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import path from 'path'


export default defineConfig({
plugins: [
  vue({ template: { transformAssetUrls } }),
  vuetify({ autoImport: true })
],
resolve: {
  alias: {
  '@': path.resolve(__dirname, './src')
  }
},
server: { port: 5173 }
})