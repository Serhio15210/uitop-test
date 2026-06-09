import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DomainError } from "../domain/errors.js";
import type { TodoRepository } from "../domain/todo-repository.js";
import type {
  Category,
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from "../domain/todo.js";

type TodoRow = {
  id: string;
  text: string;
  completed: number;
  created_at: string;
  completed_at: string | null;
  category_id: string;
  category_name: string;
  category_color: string;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "#6d5dfc" },
  { id: "personal", name: "Personal", color: "#e96f92" },
  { id: "health", name: "Health", color: "#31a789" },
  { id: "learning", name: "Learning", color: "#e49b36" },
];

const TODO_SELECT = `
  SELECT
    todos.id,
    todos.text,
    todos.completed,
    todos.created_at,
    todos.completed_at,
    categories.id AS category_id,
    categories.name AS category_name,
    categories.color AS category_color
  FROM todos
  JOIN categories ON categories.id = todos.category_id
`;

export class SqliteTodoRepository implements TodoRepository {
  private readonly database: Database.Database;

  constructor(filename: string) {
    if (filename !== ":memory:") {
      mkdirSync(dirname(resolve(filename)), { recursive: true });
    }

    this.database = new Database(filename);
    this.database.pragma("journal_mode = WAL");
    this.database.pragma("foreign_keys = ON");
  }

  async initialize() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL CHECK(length(text) BETWEEN 1 AND 200),
        category_id TEXT NOT NULL REFERENCES categories(id),
        completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
        created_at TEXT NOT NULL,
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_todos_category_id
      ON todos(category_id);
    `);

    const insert = this.database.prepare(
      `INSERT OR IGNORE INTO categories (id, name, color)
       VALUES (@id, @name, @color)`,
    );
    this.database.transaction((categories: Category[]) => {
      categories.forEach((category) => insert.run(category));
    })(DEFAULT_CATEGORIES);
  }

  async getCategories() {
    return this.database
      .prepare("SELECT id, name, color FROM categories ORDER BY rowid")
      .all() as Category[];
  }

  async getTodos(categoryId?: string) {
    this.removeExpiredCompletedTodos();
    const rows = categoryId
      ? (this.database
          .prepare(
            `${TODO_SELECT}
             WHERE categories.id = ?
             ORDER BY todos.created_at DESC`,
          )
          .all(categoryId) as TodoRow[])
      : (this.database
          .prepare(`${TODO_SELECT} ORDER BY todos.created_at DESC`)
          .all() as TodoRow[]);

    return rows.map(mapTodo);
  }

  async getTodo(id: string) {
    const row = this.database
      .prepare(`${TODO_SELECT} WHERE todos.id = ?`)
      .get(id) as TodoRow | undefined;
    return row ? mapTodo(row) : undefined;
  }

  async createTodo(input: CreateTodoInput) {
    this.database.transaction(() => {
      const category = this.database
        .prepare("SELECT id FROM categories WHERE id = ?")
        .get(input.categoryId);
      if (!category) {
        throw new DomainError("CATEGORY_NOT_FOUND", "Category not found.");
      }

      const count = this.database
        .prepare("SELECT COUNT(*) AS count FROM todos WHERE category_id = ?")
        .get(input.categoryId) as { count: number };
      if (count.count >= 5) {
        throw new DomainError(
          "CATEGORY_LIMIT",
          "This category already has the maximum of 5 tasks.",
        );
      }

      this.database
        .prepare(
          `INSERT INTO todos (id, text, category_id, completed, created_at)
           VALUES (?, ?, ?, 0, ?)`,
        )
        .run(input.id, input.text, input.categoryId, new Date().toISOString());
    })();

    const todo = await this.getTodo(input.id);
    if (!todo) throw new Error("Created todo could not be read.");
    return todo;
  }

  async updateTodo(id: string, input: UpdateTodoInput) {
    const result = this.database.transaction(() => {
      const existingTodo = this.database
        .prepare("SELECT id FROM todos WHERE id = ?")
        .get(id);
      if (!existingTodo) return undefined;

      const category = this.database
        .prepare("SELECT id FROM categories WHERE id = ?")
        .get(input.categoryId);
      if (!category) {
        throw new DomainError("CATEGORY_NOT_FOUND", "Category not found.");
      }

      const count = this.database
        .prepare(
          `SELECT COUNT(*) AS count
           FROM todos
           WHERE category_id = ? AND id <> ?`,
        )
        .get(input.categoryId, id) as { count: number };
      if (count.count >= 5) {
        throw new DomainError(
          "CATEGORY_LIMIT",
          "This category already has the maximum of 5 tasks.",
        );
      }

      this.database
        .prepare("UPDATE todos SET text = ?, category_id = ? WHERE id = ?")
        .run(input.text, input.categoryId, id);

      return true;
    })();

    return result ? this.getTodo(id) : undefined;
  }

  async updateTodoStatus(id: string, completed: boolean) {
    const result = this.database
      .prepare("UPDATE todos SET completed = ?, completed_at = ? WHERE id = ?")
      .run(completed ? 1 : 0, completed ? new Date().toISOString() : null, id);
    return result.changes ? this.getTodo(id) : undefined;
  }

  async deleteTodo(id: string) {
    return (
      this.database.prepare("DELETE FROM todos WHERE id = ?").run(id).changes >
      0
    );
  }

  close() {
    this.database.close();
  }

  private removeExpiredCompletedTodos() {
    this.database
      .prepare(
        `DELETE FROM todos
         WHERE completed = 1
           AND completed_at IS NOT NULL
           AND completed_at <= ?`,
      )
      .run(new Date(Date.now() - 5_000).toISOString());
  }
}

function mapTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    completedAt: row.completed_at,
    category: {
      id: row.category_id,
      name: row.category_name,
      color: row.category_color,
    },
  };
}
