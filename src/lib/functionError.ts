export async function functionErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') return fallback;
  const message = 'message' in error && typeof error.message === 'string' ? error.message : fallback;
  const context = 'context' in error ? error.context : undefined;
  if (!(context instanceof Response)) return message;

  try {
    const payload: unknown = await context.clone().json();
    if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
      return payload.error;
    }
  } catch {
    // The response did not contain JSON, so the original Supabase message is the best fallback.
  }
  return message;
}
