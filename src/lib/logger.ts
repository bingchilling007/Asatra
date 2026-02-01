/**
 * Simple Logger Utility
 * Standardizes log format across the application.
 */

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      ...(meta && { meta }),
    };

    // In production, you might send this to external service (Datadog, Sentry, etc.)
    // For now, we log to stdout/stderr
    if (level === 'error') {
      console.error(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }
}

export const logger = new Logger();
