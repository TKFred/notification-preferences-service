import { RequestHandler } from 'express';
import { z } from 'zod';

export function validateBody<T extends z.ZodTypeAny>(schema: T): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'validation_error',
        details: result.error.flatten(),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}