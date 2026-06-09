export type AppConfig = {
  port: number;
  databasePath: string;
  allowedOrigins: string[];
};

export function getConfig(environment = process.env): AppConfig {
  const defaultDatabasePath = environment.VERCEL
    ? "/tmp/taskflow.db"
    : "./data/todos.db";

  return {
    port: Number(environment.PORT ?? 4000),
    databasePath: environment.DATABASE_PATH ?? defaultDatabasePath,
    allowedOrigins: (environment.FRONTEND_URL ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
