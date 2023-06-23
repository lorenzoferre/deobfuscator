import { test, describe } from "node:test";
import assert from 'node:assert/strict';

import { deobfuscate } from "../src/deobfuscator.js";

describe("unary expressions", () => {
    test("typeof", () => {
        assert.strictEqual(deobfuscate(`typeof "hi";`), `"string";`)
    });
    test("+", () => {
        assert.strictEqual(deobfuscate(`+"1";`), `1;`)
    });

    test("-", (t) => {
        assert.strictEqual(deobfuscate(`-"1"`),`-1;`)
    });

    test("!", (t) => {
        assert.strictEqual(deobfuscate(`!true;`),`false;`)
    });

    test("~", (t) => {
        assert.strictEqual(deobfuscate(`~1;`),`-2;`)
    });
});