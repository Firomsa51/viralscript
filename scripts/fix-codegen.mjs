#!/usr/bin/env node
// After running orval codegen, fix the api-zod barrel to only re-export the generated API.
// Orval tends to add stale extra exports (./generated/types, ./generated/api.schemas) that
// cause duplicate-export TypeScript errors.
import { writeFileSync } from "fs";

writeFileSync(
  "lib/api-zod/src/index.ts",
  'export * from "./generated/api";\n',
  "utf8"
);
console.log("fix-codegen: lib/api-zod/src/index.ts reset to clean barrel.");
