import { test } from "node:test";
import assert from "node:assert/strict";

import deobfuscate from "../src/deobfuscator.js";

import { removeNewLinesAndTabs } from "../src/utils/util.js";

test("evaluation of functions with literal node type as inputs", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        function sum(a, b) {
            return a + b;
        }
        console.log(sum(2,2));
        `,
        true
      )
    ),
    `console.log(4);`
  );
});

test("evaluation of arrow functions with literal node type as inputs and implicit return", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        let sum = (a,b) => a + b;
        console.log(sum(2,2));
        `,
        true
      )
    ),
    `console.log(4);`
  );
});

test("evaluation of arrow functions with literal node type as inputs", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        let sub = (a,b) => {return a - b;};
        console.log(sub(4,2));
        `,
        true
      )
    ),
    `console.log(2);`
  );
});
