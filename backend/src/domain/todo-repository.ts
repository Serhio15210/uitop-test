import type {
  Category,
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "./todo.js";

export interface TodoRepository {
  initialize(): Promise<unknown>;
  getCategories(): Promise<Category[]>;
  getTodos(categoryId?: string): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(input: CreateTodoInput): Promise<Todo>;
  updateTodo(id: string, input: UpdateTodoInput): Promise<Todo | undefined>;
  updateTodoStatus(id: string, completed: boolean): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;
  close(): unknown;
}
