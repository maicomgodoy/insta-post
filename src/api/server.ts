import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/error-handler'
import { logger } from './lib/logger'
import { healthRoutes } from './routes/health'
import { authRoutes } from './routes/auth'
import { subscriptionRoutes } from './routes/subscriptions'
import { creditRoutes } from './routes/credits'
import { stripeWebhookHandler } from './routes/webhooks/stripe'

const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// Middleware básico
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}))

// IMPORTANTE: Webhook do Stripe precisa do raw body para verificação de assinatura
// Esta rota deve vir ANTES do express.json()
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler)

// Middleware para parsing JSON (após webhook)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  })
  next()
})

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/credits', creditRoutes)

// Error handler (deve ser o último middleware)
app.use(errorHandler)

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    env: NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

export default app
