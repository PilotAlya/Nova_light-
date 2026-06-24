import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  client: "better-sqlite3",
  connection: {
    filename: resolve(__dirname, "../data/nova.db"),
  },
  useNullAsDefault: true,
  migrations: {
    directory: resolve(__dirname, "../migrations"),
  },
  seeds: {
    directory: resolve(__dirname, "../seeds"),
  },
};
