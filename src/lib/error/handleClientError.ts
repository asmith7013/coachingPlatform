export function handleClientError(err: unknown, context: string = "Unknown") {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err, null, 2);
  
    if (process.env.NODE_ENV === "development") {
      console.error(`❌ [${context}]`, message);
    }
  
    return message;
}