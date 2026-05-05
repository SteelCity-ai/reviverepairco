import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";

function createValidator(
  source: "body" | "query" | "params",
  schema: ZodSchema,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      if (source === "body") req.body = parsed;
      else if (source === "query") (req as unknown as { query: unknown }).query = parsed;
      else (req as unknown as { params: unknown }).params = parsed;
      next();
    } catch (err) {
      const zodError = err as ZodError;
      const errors = zodError.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      const summary = errors
        .map((e) => (e.path ? `${e.path}: ${e.message}` : e.message))
        .join("; ");
      res.status(400).json({
        error: `Validation failed — ${summary}`,
        details: errors,
      });
    }
  };
}

export const validate = {
  body: (schema: ZodSchema) => createValidator("body", schema),
  query: (schema: ZodSchema) => createValidator("query", schema),
  params: (schema: ZodSchema) => createValidator("params", schema),
};
