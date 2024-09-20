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
        `
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
        `
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
        `
      )
    ),
    `console.log(2);`
  );
});

test("evaluation of update expressions", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        let a = 5;
        a++;
        a *= 2;
        a--;     
        console.log(a);
        `
      )
    ),
    `console.log(11);`
  );
});

test("evaluation of update expressions in different scopes", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        let func = (a) => {
          a++;
          a *= 2;
          a--;
          return a;
        } 
        let a = 5;
        console.log(func(a));
        `
      )
    ),
    `console.log(11);`
  );
});

test("control flow unflattening", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        var a = 1;
        var b,c;
        do {
        switch(a) {
        case 1: { a = 3; } break;
        case 2: { c = a * b; } break;
        case 3: { b = 10; a = 2; } break;
        }
        }while(c != 20);
        console.log(c);
        `
      )
    ),
    `console.log(20);`
  );
});

test("dynamic operations", () => {
  removeNewLinesAndTabs(
    deobfuscate(
      `
      hpQ();
      ZpQ();
      function hpQ() {
          GM = !+[] + !+[],
          nM = [+!+[]] + [+[]] - +!+[] - +!+[],
          XM = [+!+[]] + [+[]] - +!+[],
          IM = +!+[] + !+[] + !+[],
          LM = [+!+[]] + [+[]] - [];
      }
      function ZpQ() {
          fUQ = GM + LM + XM * LM * LM + GM * LM * LM * LM + nM * LM * LM * LM * LM + GM * LM * LM * LM * LM * LM + IM * LM * LM * LM * LM * LM * LM * LM * LM * LM * LM * LM * LM * LM + XM * LM * LM * LM * LM * LM * LM * LM * LM + LM * LM * LM * LM * LM * LM * LM * LM * LM;
      }
      var GM;
      var XM;
      var nM;
      var LM;
      var IM;
      `
    )
  ),
    `hpQ(); ZpQ(); function hpQ() {} function ZpQ() { fUQ = 30001900282912; }`;
});
