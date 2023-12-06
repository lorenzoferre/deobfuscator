import { test, describe } from "node:test";
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
