import { test, describe } from "node:test";
import assert from 'node:assert/strict';

import { deobfuscate } from "../src/deobfuscator.js";

describe("binary expressions", () => {
    test("arithmetic operators", () => {
        assert.strictEqual(deobfuscate(`1 + 1;`), `2;`);
        assert.strictEqual(deobfuscate(`1 - 1;`), `0;`);
        assert.strictEqual(deobfuscate(`2 * 2;`), `4;`);
        assert.strictEqual(deobfuscate(`4 / 2;`), `2;`);
        assert.strictEqual(deobfuscate(`4 % 2;`), `0;`);
        assert.strictEqual(deobfuscate(`1 + 1;`), `2;`);
        assert.strictEqual(deobfuscate(`2 ** 2;`), `4;`);     
    });

    test("bitwise shift operators", () => {
        assert.strictEqual(deobfuscate(`4 << 2;`), `16;`);
        assert.strictEqual(deobfuscate(`8 >> 2;`), `2;`);
        assert.strictEqual(deobfuscate(`-1 >>> 2;`), `1073741823;`);
    });

    test("logic operators", () => {
        assert.strictEqual(deobfuscate(`true && false;`), `false;`);
        assert.strictEqual(deobfuscate(`true || false;`), `true;`); 
        assert.strictEqual(deobfuscate(`null ?? "hi"`), `"hi";`);
        assert.strictEqual(deobfuscate(`"hi" ?? "hello"`), `"hi";`);  
    });

    test("binary bitwise operators", () => {
        assert.strictEqual(deobfuscate(`5 & 3;`), `1;`);
        assert.strictEqual(deobfuscate(`1 ^ 2;`), `3;`);
        assert.strictEqual(deobfuscate(`1 | 2;`), `3;`);
    });

    test("relational operators", () => {
        assert.strictEqual(deobfuscate(`1 < 2;`), `true;`);
        assert.strictEqual(deobfuscate(`1 > 2;`), `false;`);
        assert.strictEqual(deobfuscate(`1 <= 2;`), `true;`);
        assert.strictEqual(deobfuscate(`1 >= 2;`), `false;`);
    });

    test("equality operators", () => {
        assert.strictEqual(deobfuscate(`1 == 1;`), `true;`);
        assert.strictEqual(deobfuscate(`1 == '1' ;`), `true;`);
        assert.strictEqual(deobfuscate(`1 !== 2;`), `true;`);
        assert.strictEqual(deobfuscate(`1 === 1 ;`), `true;`);
        assert.strictEqual(deobfuscate(`1 === '1' ;`), `false;`);
        assert.strictEqual(deobfuscate(`1 !== '1';`), `true;`);
    });
});