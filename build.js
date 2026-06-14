#!/usr/bin/env node
// build.js — Transpile every .jsx (flows/ + shared/) to a plain .js beside it.
// Output is classic-script JS referencing the global `React` (loaded via CDN UMD).
// No bundler, no in-browser Babel. Run: npm run build
//
// Edit .jsx → run `npm run build` → commit both .jsx and the generated .js.

const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const ROOTS = ["flows", "shared", "design-system"];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".jsx")) out.push(full);
  }
  return out;
}

const files = ROOTS.filter(fs.existsSync).flatMap((r) => walk(r));
let ok = 0;
for (const file of files) {
  const out = file.replace(/\.jsx$/, ".js");
  const { code } = babel.transformFileSync(file, { sourceMaps: false });
  // Wrap in an IIFE so each file's top-level declarations are isolated — plain
  // <script> tags share one global scope and would otherwise collide
  // (e.g. several files each do `const { useState } = React`). Cross-file
  // sharing goes through `window.*` (window.SharedShell, Object.assign(window,…)).
  const wrapped = "(function () {\n" + code + "\n})();\n";
  fs.writeFileSync(out, wrapped);
  console.log("  ✓ " + file + " → " + out);
  ok++;
}
console.log(`\nBuilt ${ok} file(s).`);
