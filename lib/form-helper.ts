// /form-helpers.ts (or at the top of your form file)

/**
 * Extracts error message from TanStack Form field errors
 * Handles both string errors and Zod StandardSchemaV1Issue objects
 */
export function getFieldError(
  errors: unknown
): string | undefined {
  if (!errors) return undefined;
  
  // If it's already a string, return it
  if (typeof errors === 'string') return errors;
  
  // If it's an array of errors, get the first one's message
  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0];
    return typeof firstError === 'string' 
      ? firstError 
      : firstError?.message;
  }
  
  // If it's a single error object with a message property
  if (typeof errors === 'object' && errors !== null && 'message' in errors) {
    return (errors as { message: string }).message;
  }
  
  return undefined;
}