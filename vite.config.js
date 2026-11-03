import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleImageGeneration } from './server/imageGeneration.js'

const imageApi = {
  name: 'stylemyth-image-api',
  configureServer(server) {
    server.middlewares.use('/api/stylist/generate', (request, response) => {
      void handleImageGeneration(request, response)
    })
  },
}

export default defineConfig({
  plugins: [react(), imageApi],
})
