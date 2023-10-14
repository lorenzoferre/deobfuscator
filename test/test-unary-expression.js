import { test, describe } from "node:test";
import assert from "node:assert/strict";

import deobfuscate from "../src/deobfuscator.js";

describe("unary expressions", () => {
  test("typeof", () => {
    assert.strictEqual(deobfuscate(`typeof "hi";`), `"string";`);
  });
  test("+", () => {
    assert.strictEqual(deobfuscate(`+"1";`), `1;`);
  });

  test("-", () => {
    assert.strictEqual(deobfuscate(`-"1"`), `-1;`);
  });

  test("!", () => {
    assert.strictEqual(deobfuscate(`!true;`), `false;`);
  });

  test("~", () => {
    assert.strictEqual(deobfuscate(`~1;`), `-2;`);
  });
});
