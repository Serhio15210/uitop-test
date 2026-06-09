import "dotenv/config";
import { app, closeDatabase, port } from "./runtime.js";

const server = app.listen(port, () => {
  console.log(`TaskFlow API is running at http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
