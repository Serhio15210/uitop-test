import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { TodoService } from "../application/todo-service.js";
import { SqliteTodoRepository } from "../infrastructure/sqlite-todo-repository.js";
import { createApp } from "./create-app.js";

describe("todos API", () => {
  const repository = new SqliteTodoRepository(":memory:");
  const service = new TodoService(repository);
  const app = createApp(service, ["http://localhost:3000"]);

  before(() => repository.initialize());
  after(() => repository.close());

  it("creates, filters, updates and deletes a todo", async () => {
    const created = await request(app)
      .post("/todos")
      .send({ text: "Prepare presentation", categoryId: "work" })
      .expect(201);

    assert.equal(created.body.text, "Prepare presentation");
    assert.equal(created.body.category.id, "work");

    const filtered = await request(app).get("/todos?category=work").expect(200);
    assert.equal(filtered.body.length, 1);

    const edited = await request(app)
      .patch(`/todos/${created.body.id}`)
      .send({ text: "Prepare demo", categoryId: "learning" })
      .expect(200);
    assert.equal(edited.body.text, "Prepare demo");
    assert.equal(edited.body.category.id, "learning");

    const completed = await request(app)
      .patch(`/todos/${created.body.id}`)
      .send({ completed: true })
      .expect(200);
    assert.equal(completed.body.completed, true);

    await request(app).delete(`/todos/${created.body.id}`).expect(204);
  });

  it("enforces the five-task category limit", async () => {
    for (let index = 0; index < 5; index += 1) {
      await request(app)
        .post("/todos")
        .send({ text: `Personal task ${index}`, categoryId: "personal" })
        .expect(201);
    }

    const response = await request(app)
      .post("/todos")
      .send({ text: "One too many", categoryId: "personal" })
      .expect(400);

    assert.match(response.body.message, /maximum of 5/i);
  });

  it("returns validation errors for invalid payloads", async () => {
    await request(app).post("/todos").send({}).expect(400);
    await request(app)
      .patch("/todos/missing")
      .send({ completed: "yes" })
      .expect(400);
  });
});
