import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  req.log?.error(
    {
      error,
      path: req.path,
      method: req.method,
    },
    'Unhandled request error',
  );

  res.status(500).json({
    error: 'internal_server_error',
    message: 'Unexpected server error',
  });
};