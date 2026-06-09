import "dotenv/config";
import { TodoService } from "./application/todo-service.js";
import { getConfig } from "./config.js";
import { createApp } from "./http/create-app.js";
import { SqliteTodoRepository } from "./infrastructure/sqlite-todo-repository.js";

const config = getConfig();
const repository = new SqliteTodoRepository(config.databasePath);

await repository.initialize();

const service = new TodoService(repository);

export const app = createApp(service, config.allowedOrigins);
export const port = config.port;
export const closeDatabase = () => repository.close();
