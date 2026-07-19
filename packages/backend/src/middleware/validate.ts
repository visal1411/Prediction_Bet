import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates req.body against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      res.status(400).json({ success: false, error: 'Validation failed', details: formatted });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validates req.query against a Zod schema.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      res.status(400).json({ success: false, error: 'Invalid query parameters', details: formatted });
      return;
    }
    // @ts-expect-error — overwriting query with parsed/coerced values
    req.query = result.data;
    next();
  };
}

function formatZodError(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    formatted[path || 'root'] = issue.message;
  }
  return formatted;
}
