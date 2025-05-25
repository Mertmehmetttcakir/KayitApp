import { NextFunction, Request, Response } from 'express';
import { ErrorLogger } from '../services/errorLogger';

export const errorHandler = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Hata logunu kaydet
    await ErrorLogger.logError(error, {
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      user: req.user?.id,
    });

    // Hata yanıtını oluştur
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    const message = error.message || 'Sunucu hatası';

    res.status(statusCode).json({
      error: {
        message,
        type: error.name,
        statusCode,
      },
    });
  } catch (logError) {
    console.error('Hata yakalama middleware hatası:', logError);
    res.status(500).json({
      error: {
        message: 'Sunucu hatası',
        type: 'InternalServerError',
        statusCode: 500,
      },
    });
  }
};

// Özel HTTP hata sınıfı
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 hata yakalayıcı
export const notFoundHandler = (req: Request, res: Response) => {
  const error = new HttpError(`Sayfa bulunamadı: ${req.path}`, 404);
  res.status(404).json({
    error: {
      message: error.message,
      type: error.name,
      statusCode: error.statusCode,
    },
  });
}; 