import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getConfig } from "./config.js";

describe("application config", () => {
  it("uses a local SQLite file by default", () => {
    assert.equal(getConfig({}).databasePath, "./data/todos.db");
  });

  it("uses Vercel temporary storage in a function runtime", () => {
    assert.equal(getConfig({ VERCEL: "1" }).databasePath, "/tmp/taskflow.db");
  });

  it("allows an explicit database path override", () => {
    assert.equal(
      getConfig({
        VERCEL: "1",
        DATABASE_PATH: "/custom/todos.db",
      }).databasePath,
      "/custom/todos.db",
    );
  });
});
