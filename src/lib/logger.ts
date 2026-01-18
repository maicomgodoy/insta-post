/**
 * Logger simples para a aplicação
 * Em produção, considere usar Winston ou Pino
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

class Logger {
  private formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry = this.formatLog(level, message, meta)
    const json = JSON.stringify(entry)
    
    switch (level) {
      case 'error':
        console.error(json)
        break
      case 'warn':
        console.warn(json)
        break
      default:
        console.log(json)
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta)
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta)
  }
}

export const logger = new Logger()
