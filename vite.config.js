import { defineConfig } from "vite";
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/AIProjectDemo/" : "/",
  test: { environment: "node" },
}));
