import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { ZodIssue, ZodType } from 'zod/v4';

function toFieldErrors<TFieldValues extends FieldValues>(issues: ZodIssue[]) {
  const errors: Record<string, { type: string; message: string }> = {};

  for (const issue of issues) {
    const path = issue.path.join('.');

    if (!path || errors[path]) {
      continue;
    }

    errors[path] = {
      type: issue.code,
      message: issue.message,
    };
  }

  return errors as FieldErrors<TFieldValues>;
}

export function createZodResolver<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    return {
      values: {},
      errors: toFieldErrors<TFieldValues>(result.error.issues),
    };
  };
}
