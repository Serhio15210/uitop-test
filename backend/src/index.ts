import "dotenv/config";
import express from "express";
import { TodoService } from "./application/todo-service.js";
import { getConfig } from "./config.js";
import { configureApp } from "./http/create-app.js";
import { SqliteTodoRepository } from "./infrastructure/sqlite-todo-repository.js";

const config = getConfig();
const repository = new SqliteTodoRepository(config.databasePath);

await repository.initialize();

const service = new TodoService(repository);
const app = configureApp(express(), service, config.allowedOrigins);

export const port = config.port;
export const closeDatabase = () => repository.close();

export default app;
