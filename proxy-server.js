// Proxy server để bypass CORS
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const cors = require('cors')

const app = express()
const PORT = 3001

// Enable CORS
app.use(cors())

// Proxy to n8n webhook
app.use('/api/webhook', createProxyMiddleware({
  target: 'https://semiyearly-deloise-unsourly.ngrok-free.dev',
  changeOrigin: true,
  pathRewrite: {
    '^/api/webhook': '/webhook'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add ngrok skip warning header
    proxyReq.setHeader('ngrok-skip-browser-warning', 'true')
  }
}))

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
})