export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown): {
  message: string
  code: string
  shouldNotify: boolean
} {
  if (error instanceof AppError) {
    return {
      message: error.userMessage,
      code: error.code,
      shouldNotify: true
    }
  }
  
  if (error instanceof Error) {
    // Storage errors
    if (error.message.includes('quota') || error.message.includes('Storage')) {
      return {
        message: 'Storage is full. Please delete old workouts or export your data.',
        code: 'STORAGE_FULL',
        shouldNotify: true
      }
    }
    
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        message: 'Network error. Check your connection and try again.',
        code: 'NETWORK_ERROR',
        shouldNotify: true
      }
    }
    
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      shouldNotify: true
    }
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN',
    shouldNotify: true
  }
}

export function logError(error: unknown, context?: string): void {
  console.error(`[ERROR${context ? ` - ${context}` : ''}]:`, error)
}
