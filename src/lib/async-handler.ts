type AsyncResult<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

export async function withErrorHandler<T>(
  fn: () => Promise<T>
): Promise<AsyncResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error('Async error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
