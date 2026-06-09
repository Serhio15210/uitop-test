import { randomUUID } from "node:crypto";
import { DomainError } from "../domain/errors.js";
import type { TodoRepository } from "../domain/todo-repository.js";

export class TodoService {
  constructor(private readonly repository: TodoRepository) {}

  getCategories() {
    return this.repository.getCategories();
  }

  getTodos(categoryId?: string) {
    return this.repository.getTodos(categoryId);
  }

  createTodo(input: unknown) {
    const payload = isRecord(input) ? input : {};
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    const categoryId =
      typeof payload.categoryId === "string" ? payload.categoryId.trim() : "";

    if (!text || text.length > 200) {
      throw new DomainError(
        "INVALID_TEXT",
        "Task text must contain between 1 and 200 characters.",
      );
    }

    if (!categoryId) {
      throw new DomainError("INVALID_CATEGORY", "Please select a category.");
    }

    return this.repository.createTodo({
      id: randomUUID(),
      text,
      categoryId,
    });
  }

  async updateTodoStatus(id: string, completed: unknown) {
    if (typeof completed !== "boolean") {
      throw new DomainError(
        "INVALID_COMPLETED",
        "Completed must be a boolean.",
      );
    }

    const todo = await this.repository.updateTodoStatus(id, completed);
    if (!todo) {
      throw new DomainError("TODO_NOT_FOUND", "Task not found.");
    }
    return todo;
  }

  async updateTodo(id: string, input: unknown) {
    const payload = isRecord(input) ? input : {};
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    const categoryId =
      typeof payload.categoryId === "string" ? payload.categoryId.trim() : "";

    if (!text || text.length > 200) {
      throw new DomainError(
        "INVALID_TEXT",
        "Task text must contain between 1 and 200 characters.",
      );
    }

    if (!categoryId) {
      throw new DomainError("INVALID_CATEGORY", "Please select a category.");
    }

    const todo = await this.repository.updateTodo(id, { text, categoryId });
    if (!todo) {
      throw new DomainError("TODO_NOT_FOUND", "Task not found.");
    }
    return todo;
  }

  async deleteTodo(id: string) {
    if (!(await this.repository.deleteTodo(id))) {
      throw new DomainError("TODO_NOT_FOUND", "Task not found.");
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
