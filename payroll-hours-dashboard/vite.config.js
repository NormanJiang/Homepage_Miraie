import { defineConfig } from "vite";

// GitHub Pages serves project sites below /<repository-name>/.
// Relative asset URLs work both there and on the existing Sites deployment.
export default defineConfig({
  base: "./",
});
