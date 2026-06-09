import cors from "cors";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { TodoService } from "../application/todo-service.js";
import { DomainError } from "../domain/errors.js";

export function configureApp(
  app: Express,
  service: TodoService,
  allowedOrigins: string[],
) {
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      name: "TaskFlow API",
      status: "ok",
    });
  });

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/categories", async (_request, response) => {
    response.json(await service.getCategories());
  });

  app.get("/todos", async (request, response) => {
    const categoryId =
      typeof request.query.category === "string"
        ? request.query.category
        : undefined;
    response.json(await service.getTodos(categoryId));
  });

  app.post("/todos", async (request, response) => {
    const todo = await service.createTodo(request.body);
    response.status(201).json(todo);
  });

  app.patch("/todos/:id", async (request, response) => {
    const isEditRequest =
      typeof request.body?.text === "string" ||
      typeof request.body?.categoryId === "string";
    const todo = isEditRequest
      ? await service.updateTodo(request.params.id, request.body)
      : await service.updateTodoStatus(
          request.params.id,
          request.body?.completed,
        );
    response.json(todo);
  });

  app.delete("/todos/:id", async (request, response) => {
    await service.deleteTodo(request.params.id);
    response.status(204).send();
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (error instanceof DomainError) {
        const status = error.code === "TODO_NOT_FOUND" ? 404 : 400;
        response.status(status).json({ message: error.message });
        return;
      }

      console.error(error);
      response.status(500).json({
        message: "Something went wrong on the server.",
      });
    },
  );

  return app;
}

export function createApp(service: TodoService, allowedOrigins: string[]) {
  return configureApp(express(), service, allowedOrigins);
}
