import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';
import { ApiErrorDetail } from '@finance/types';

interface RequestValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schema: RequestValidationSchema | ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('body' in schema || 'query' in schema || 'params' in schema) {
        const fullSchema = schema as RequestValidationSchema;
        if (fullSchema.body) {
          req.body = await fullSchema.body.parseAsync(req.body);
        }
        if (fullSchema.query) {
          req.query = await fullSchema.query.parseAsync(req.query);
        }
        if (fullSchema.params) {
          req.params = await fullSchema.params.parseAsync(req.params);
        }
      } else {
        req.body = await (schema as ZodTypeAny).parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: ApiErrorDetail[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        next(new ValidationError('Request validation failed', details));
      } else {
        next(error);
      }
    }
  };
}
