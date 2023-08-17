import { test, describe } from "node:test";
import assert from 'node:assert/strict';

import Deobfuscator from "../src/deobfuscator.js";

describe("binary expressions", () => {
    test("arithmetic operators", () => {
        assert.strictEqual(new Deobfuscator(`1 + 1;`).deobfuscate(), `2;`);
        assert.strictEqual(new Deobfuscator(`1 - 1;`).deobfuscate(), `0;`);
        assert.strictEqual(new Deobfuscator(`2 * 2;`).deobfuscate(), `4;`);
        assert.strictEqual(new Deobfuscator(`4 / 2;`).deobfuscate(), `2;`);
        assert.strictEqual(new Deobfuscator(`4 % 2;`).deobfuscate(), `0;`);
        assert.strictEqual(new Deobfuscator(`1 + 1;`).deobfuscate(), `2;`);
        assert.strictEqual(new Deobfuscator(`2 ** 2;`).deobfuscate(), `4;`);     
    });

    test("bitwise shift operators", () => {
        /*assert.strictEqual(new Deobfuscator(`4 << 2;`).deobfuscate(), `16;`);
        assert.strictEqual(new Deobfuscator(`8 >> 2;`).deobfuscate(), `2;`);
        assert.strictEqual(new Deobfuscator(`-1 >>> 2;`).deobfuscate(), `1073741823;`);*/
    });

    test("logic operators", () => {
        assert.strictEqual(new Deobfuscator(`true && false;`).deobfuscate(), `false;`);
        assert.strictEqual(new Deobfuscator(`true || false;`).deobfuscate(), `true;`); 
        assert.strictEqual(new Deobfuscator(`null ?? "hi"`).deobfuscate(), `"hi";`);
        assert.strictEqual(new Deobfuscator(`"hi" ?? "hello"`).deobfuscate(), `"hi";`);  
    });

    test("binary bitwise operators", () => {
        assert.strictEqual(new Deobfuscator(`5 & 3;`).deobfuscate(), `1;`);
        assert.strictEqual(new Deobfuscator(`1 ^ 2;`).deobfuscate(), `3;`);
        assert.strictEqual(new Deobfuscator(`1 | 2;`).deobfuscate(), `3;`);
    });

    test("relational operators", () => {
        assert.strictEqual(new Deobfuscator(`1 < 2;`).deobfuscate(), `true;`);
        assert.strictEqual(new Deobfuscator(`1 > 2;`).deobfuscate(), `false;`);
        assert.strictEqual(new Deobfuscator(`1 <= 2;`).deobfuscate(), `true;`);
        assert.strictEqual(new Deobfuscator(`1 >= 2;`).deobfuscate(), `false;`);
    });

    test("equality operators", () => {
        assert.strictEqual(new Deobfuscator(`1 == 1;`).deobfuscate(), `true;`);
        assert.strictEqual(new Deobfuscator(`1 == '1';`).deobfuscate(), `true;`);
        assert.strictEqual(new Deobfuscator(`1 !== 2;`).deobfuscate(), `true;`);
        assert.strictEqual(new Deobfuscator(`1 === 1 ;`).deobfuscate(), `true;`);
        assert.strictEqual(new Deobfuscator(`1 === '1' ;`).deobfuscate(), `false;`);
        assert.strictEqual(new Deobfuscator(`1 !== '1';`).deobfuscate(), `true;`);
    });
});