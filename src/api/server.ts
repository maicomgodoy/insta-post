import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/error-handler'
import { logger } from './lib/logger'
import { healthRoutes } from './routes/health'

const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// Middleware básico
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}))
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
