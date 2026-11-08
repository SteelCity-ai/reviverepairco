import { register } from "node:module";

// Next.js resolves extension-less specifiers in its bundler; Node's ESM resolver
// needs the real file name. Register a tiny hook so route handlers can be tested
// directly with `node --test`.
register("./resolve-hooks.mjs", import.meta.url);
