import { test, describe } from "node:test";
import assert from 'node:assert/strict';

import Deobfuscator from "../src/deobfuscator.js";

describe("unary expressions", () => {
    test("typeof", () => {
        assert.strictEqual(new Deobfuscator(`typeof "hi";`).deobfuscate(), `"string";`)
    });
    test("+", () => {
        assert.strictEqual(new Deobfuscator(`+"1";`).deobfuscate(), `1;`)
    });

    /*test("-", (t) => {
        assert.strictEqual(new Deobfuscator(`-"1"`).deobfuscate(),`-1;`)
    });*/

    test("!", (t) => {
        assert.strictEqual(new Deobfuscator(`!true;`).deobfuscate(),`false;`)
    });

    /*test("~", (t) => {
        assert.strictEqual(new Deobfuscator(`~1;`).deobfuscate(),`-2;`)
    });*/
});