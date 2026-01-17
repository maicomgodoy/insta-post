import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wrapper para handlers async
 * Captura erros e passa para o middleware de erro
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
