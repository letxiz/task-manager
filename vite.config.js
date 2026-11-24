import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const modoApi = command === 'serve' ? loadEnv(mode, process.cwd()).VITE_API_PREVIEW : undefined
  const permiteGravar = modoApi === 'write'
  const previaApi = permiteGravar || modoApi === 'true'
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: previaApi ? '127.0.0.1' : '0.0.0.0',
      port: 5173,
      proxy: previaApi ? {
        '^/api/(?:(tarefas|topicos)(?:/ordem/manual|/[^/?]+)?|registros/limpeza)$': {
          target: 'http://127.0.0.1:3000',
          bypass(req) {
            if (req.socket.localAddress !== '127.0.0.1' || req.socket.remoteAddress !== '127.0.0.1') return false
            if (req.method === 'GET' && ['/api/tarefas', '/api/topicos'].includes(req.url)) return undefined
            if (!permiteGravar || req.headers.origin !== `http://${req.headers.host}`) return false
            if (req.method === 'POST' && ['/api/tarefas', '/api/topicos', '/api/registros/limpeza'].includes(req.url)) return undefined
            if (req.method === 'PATCH' && ['/api/tarefas/ordem/manual', '/api/topicos/ordem/manual'].includes(req.url)) return undefined
            if (['PATCH', 'DELETE'].includes(req.method)
              && /^\/api\/(tarefas|topicos)\/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(req.url)) return undefined
            return false
          },
        },
      } : undefined,
    },
  }
})
