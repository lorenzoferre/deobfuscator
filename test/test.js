import { test, describe } from "node:test";
import assert from 'node:assert/strict';

import { deobfuscate } from "../src/deobfuscator.js";

test("hex to value", () => {
    assert.strictEqual(deobfuscate(`console.log("\x61\x61\x61")`), `console.log("aaa");`);
});

test("bracket to dot", () => {
    assert.strictEqual(deobfuscate(`console["log"]("a")`), `console.log("a");`);
});

test("remove empty statement", () => {
    assert.strictEqual(deobfuscate(`;;;;;;console.log("a");;;;;;`), `console.log("a");`);
});


describe("if and conditional statement", () => {
    test("if always true", () => {
        assert.strictEqual(deobfuscate(`if (1 == 1) { console.log("1 == 1"); }`), `console.log("1 == 1");`);
    });
    test("if always true", () => {
        assert.strictEqual(deobfuscate(`if (1 == 1) { } else { console.log("1 != 1"); }`), ``);
    });
    test("if always false", () => {
        assert.strictEqual(deobfuscate(`if (1 != 1) { } else { console.log("1 != 1"); }`), `console.log("1 != 1");`);
    });
    test("if always false", () => {
        assert.strictEqual(deobfuscate(`if (1 != 1) { console.log("1 == 1"); }`), ``);
    });
    test("ternary always true", () => {
        assert.strictEqual(deobfuscate(`1 == 1 ? console.log("1 == 1") : console.log("no");`), `console.log("1 == 1");`);
    });
    test("ternary always false", () => {
        assert.strictEqual(deobfuscate(`1 != 1 ? console.log("1 == 1") : console.log("1 != 1");`), `console.log("1 != 1");`);
    });

});

test("unreachable function", () => {
    assert.strictEqual(deobfuscate(`function a() {} function b() {a();} function c() {a(); b();} console.log("a");`), `console.log("a");`);
});

test("defeating array mapping", () => {
    assert.strictEqual(deobfuscate(`var _0x3baf=["Hello Venus","log","Hello Earth","Hello Mars"];console[_0x3baf[1]](_0x3baf[0]);console[_0x3baf[1]](_0x3baf[2]);console[_0x3baf[1]](_0x3baf[3])`).split("\n").join(""),`var _0x3baf = ["Hello Venus", "log", "Hello Earth", "Hello Mars"];console.log("Hello Venus");console.log("Hello Earth");console.log("Hello Mars");`);
});
