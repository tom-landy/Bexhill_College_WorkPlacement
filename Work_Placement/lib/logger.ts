type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const safeMeta = meta ? JSON.stringify(meta) : "";
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message} ${safeMeta}`;
  // eslint-disable-next-line no-console
  console[level](line);
}
