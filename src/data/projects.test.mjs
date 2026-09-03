import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = fs.readFileSync(new URL("./projects.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "projects.ts",
});
const projectsModule = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const { featuredProjects, projects } = projectsModule;

test("featured projects exclude archived work while the full catalog retains it", () => {
  assert.ok(projects.some((project) => project.archived));
  assert.ok(featuredProjects.every((project) => !project.archived));
});

test("project collections can be ordered newest first without changing the input", () => {
  const fixture = [
    { id: "middle", order: 2 },
    { id: "newest", order: 4 },
    { id: "oldest", order: 1 },
  ];

  const ordered = projectsModule.sortProjectsNewestFirst?.(fixture) ?? [];

  assert.deepEqual(ordered.map((project) => project.id), ["newest", "middle", "oldest"]);
  assert.deepEqual(fixture.map((project) => project.id), ["middle", "newest", "oldest"]);
});
