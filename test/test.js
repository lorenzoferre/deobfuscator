import { test, describe } from "node:test";
import assert from 'node:assert/strict';

import Deobfuscator from "../src/deobfuscator.js";

test("hex to value", () => {
    assert.strictEqual(new Deobfuscator(`console.log("\x61\x61\x61")`).deobfuscate(), `console.log("aaa");`);
});

test("bracket to dot", () => {
    assert.strictEqual(new Deobfuscator(`console["log"]("a")`).deobfuscate(), `console.log("a");`);
});

test("remove empty statement", () => {
    assert.strictEqual(new Deobfuscator(`;;;;;;console.log("a");;;;;;`).deobfuscate(), `console.log("a");`);
});


describe("if and conditional statement", () => {
    test("if always true", () => {
        assert.strictEqual(new Deobfuscator(`if (1 == 1) { console.log("1 == 1"); }`).deobfuscate(), `console.log("1 == 1");`);
    });
    test("if always true", () => {
        assert.strictEqual(new Deobfuscator(`if (1 == 1) { } else { console.log("1 != 1"); }`).deobfuscate(), ``);
    });
    test("if always false", () => {
        assert.strictEqual(new Deobfuscator(`if (1 != 1) { } else { console.log("1 != 1"); }`).deobfuscate(), `console.log("1 != 1");`);
    });
    test("if always false", () => {
        assert.strictEqual(new Deobfuscator(`if (1 != 1) { console.log("1 == 1"); }`).deobfuscate(), ``);
    });
    test("ternary always true", () => {
        assert.strictEqual(new Deobfuscator(`1 == 1 ? console.log("1 == 1") : console.log("no");`).deobfuscate(), `console.log("1 == 1");`);
    });
    test("ternary always false", () => {
        assert.strictEqual(new Deobfuscator(`1 != 1 ? console.log("1 == 1") : console.log("1 != 1");`).deobfuscate(), `console.log("1 != 1");`);
    });

});

test("unreachable function", () => {
    assert.strictEqual(new Deobfuscator(`function a() {} function b() {a();} function c() {a(); b();} console.log("a");`).deobfuscate(), `console.log("a");`);
});

test("defeating array mapping", () => {
    assert.strictEqual(new Deobfuscator(`var _0x3baf=["Hello Venus","log","Hello Earth","Hello Mars"];console[_0x3baf[1]](_0x3baf[0]);console[_0x3baf[1]](_0x3baf[2]);console[_0x3baf[1]](_0x3baf[3])`).deobfuscate().split("\n").join(""),`console.log("Hello Venus");console.log("Hello Earth");console.log("Hello Mars");`);
});
