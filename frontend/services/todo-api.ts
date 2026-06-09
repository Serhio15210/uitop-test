import axios from "axios";
import type { Category, Todo } from "@/types/todo";

const DEFAULT_API_URL = "http://localhost:4000";

function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    return DEFAULT_API_URL;
  }

  const url =
    configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")
      ? configuredUrl
      : `https://${configuredUrl}`;

  return url.replace(/\/+$/, "");
}

export type CreateTodoPayload = {
  text: string;
  categoryId: string;
};

export type UpdateTodoPayload = {
  text: string;
  categoryId: string;
};

export interface TodoApi {
  getOverview(): Promise<{ todos: Todo[]; categories: Category[] }>;
  createTodo(payload: CreateTodoPayload): Promise<Todo>;
  updateTodo(id: string, payload: UpdateTodoPayload): Promise<Todo>;
  updateStatus(id: string, completed: boolean): Promise<Todo>;
  deleteTodo(id: string): Promise<boolean>;
  isNotFound(error: unknown): boolean;
  getErrorMessage(error: unknown): string;
}

const client = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

export const todoApi: TodoApi = {
  async getOverview() {
    const [todosResponse, categoriesResponse] = await Promise.all([
      client.get<Todo[]>("/todos"),
      client.get<Category[]>("/categories"),
    ]);
    return {
      todos: todosResponse.data,
      categories: categoriesResponse.data,
    };
  },

  async createTodo(payload) {
    const response = await client.post<Todo>("/todos", payload);
    return response.data;
  },

  async updateTodo(id, payload) {
    const response = await client.patch<Todo>(`/todos/${id}`, payload);
    return response.data;
  },

  async updateStatus(id, completed) {
    const response = await client.patch<Todo>(`/todos/${id}`, { completed });
    return response.data;
  },

  async deleteTodo(id) {
    await client.delete(`/todos/${id}`);
    return true;
  },

  isNotFound(error) {
    return axios.isAxiosError(error) && error.response?.status === 404;
  },

  getErrorMessage(error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message ?? "Could not reach the server.";
    }
    return "Something went wrong. Please try again.";
  },
};
