import path from "node:path"
import { existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import { createRequire } from "node:module"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoChild = path.resolve(here, "..", "..")
const siblingRepo = path.resolve(here, "..", "crossusage-source")
const repo = process.env.CROSSUSAGE_REPO_ROOT ||
  (existsSync(path.join(repoChild, "src", "lib", "settings.ts")) ? repoChild : siblingRepo)
const require = createRequire(path.join(repo, "package.json"))
const { defineConfig } = await import(pathToFileURL(require.resolve("vite")).href)
const react = (await import(pathToFileURL(require.resolve("@vitejs/plugin-react")).href)).default
const tailwindcss = (await import(pathToFileURL(require.resolve("@tailwindcss/vite")).href)).default

export default defineConfig({
  root: here,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: path.join(repo, "src") + path.sep },
      { find: /^@tauri-apps\/plugin-store$/, replacement: path.join(here, "tauri-store-stub.ts") },
      { find: /^react$/, replacement: require.resolve("react") },
      { find: /^react\/jsx-runtime$/, replacement: require.resolve("react/jsx-runtime") },
      { find: /^react\/jsx-dev-runtime$/, replacement: require.resolve("react/jsx-dev-runtime") },
      { find: /^react-dom$/, replacement: require.resolve("react-dom") },
      { find: /^react-dom\/client$/, replacement: require.resolve("react-dom/client") },
    ],
  },
  server: {
    host: "127.0.0.1",
    port: 4317,
    strictPort: true,
    fs: { allow: [here, repo] },
  },
})
