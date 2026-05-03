import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";

/**
 * Creates Express middleware that validates a request part against a Zod schema.
 *
 * Usage:
 *   validate.body(myZodSchema)        — validates req.body
 *   validate.query(myZodSchema)       — validates req.query
 *   validate.params(myZodSchema)      — validates req.params
 */
function createValidator(
  source: "body" | "query" | "params",
  schema: ZodSchema,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Replace the source with the parsed (and coerced) value
      if (source === "body") req.body = parsed;
      else if (source === "query") (req as Record<string, unknown>).query = parsed;
      else (req as Record<string, unknown>).params = parsed;
      next();
    } catch (err) {
      const zodError = err as ZodError;
      const errors = zodError.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({
        error: "Validation failed",
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
