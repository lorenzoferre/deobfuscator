import { test, describe } from "node:test";
import assert from "node:assert/strict";

import deobfuscate from "../src/deobfuscator.js";

import { removeNewLinesAndTabs } from "../src/utils/util.js";
import { strictEqual } from "node:assert";

test("reconstruct variable declarations", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(`
        var a,b,c;
        console.log(a,b,c);`)
    ),
    `var a; var b; var c; console.log(a, b, c);`
  );
});

test("hex to value", () => {
  assert.strictEqual(deobfuscate(`console.log("\x61\x61\x61")`), `console.log("aaa");`);
});

test("bracket to dot", () => {
  assert.strictEqual(deobfuscate(`console["log"]("a")`), `console.log("a");`);
});

test("transform sequence expression", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        var a = 1, b = 2, c = 3;
        a++, b++, c++;
        `
      )
    ),
    `var a = 1; var b = 2; var c = 3; a++; b++; c++;`
  );
});

test("remove empty statement", () => {
  assert.strictEqual(deobfuscate(`;;;console.log("a");;;`), `console.log("a");`);
});

test("untangling scope confusion", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(`
        let x = 0; 
        { 
          let x = 30;
          x += 1;
        }
        x += 1;
        console.log(x);
        `)
    ),
    `let x = 0; { let _x = 30; _x += 1; } x += 1; console.log(x);`
  );
});

describe("if and conditional statement", () => {
  test("if always true", () => {
    assert.strictEqual(
      deobfuscate(`if (1 == 1) { console.log("1 == 1"); }`),
      `console.log("1 == 1");`
    );
  });
  test("if always true empty", () => {
    assert.strictEqual(
      deobfuscate(`if (1 == 1) { } else { console.log("1 != 1"); }`),
      ``
    );
  });
  test("if always false", () => {
    assert.strictEqual(
      deobfuscate(`if (1 != 1) { } else { console.log("1 != 1"); }`),
      `console.log("1 != 1");`
    );
  });
  test("if always false empty", () => {
    assert.strictEqual(deobfuscate(`if (1 != 1) { console.log("1 == 1"); }`), ``);
  });
  test("ternary always true", () => {
    assert.strictEqual(
      deobfuscate(`1 == 1 ? console.log("1 == 1") : console.log("no");`),
      `console.log("1 == 1");`
    );
  });
  test("ternary always false", () => {
    assert.strictEqual(
      deobfuscate(`1 != 1 ? console.log("1 == 1") : console.log("1 != 1");`),
      `console.log("1 != 1");`
    );
  });
});

describe("reachability of function", () => {
  test("unreachable function", () => {
    assert.strictEqual(
      deobfuscate(
        `
        function a() {}
        function b() { a(); } 
        function c() { a(); b(); } 
        console.log("a");
        `
      ),
      `console.log("a");`
    );
  });
});

test("defeating array mapping", () => {
  assert.strictEqual(
    removeNewLinesAndTabs(
      deobfuscate(
        `
        var _0xa=["feel","log","free","to contribute"];
        console[_0xa[1]](_0xa[0]);
        console[_0xa[1]](_0xa[2]);
        console[_0xa[1]](_0xa[3])
        `
      )
    ),
    `console.log("feel"); console.log("free"); console.log("to contribute");`
  );
});

describe("defeating object mapping", () => {
  test("defeating object mapping with literals", () => {
    assert.strictEqual(
      deobfuscate(`var obj = { "a": 1 }; console.log(obj.a)`),
      `console.log(1);`
    );
  });
});

describe("propagations", () => {
  test("constant propagation of a literal value", () => {
    assert.strictEqual(deobfuscate(`var a = 5; console.log(a);`), `console.log(5);`);
  });
  test("constant propagation of an array expression that has literal values", () => {
    assert.strictEqual(
      deobfuscate(`var a = [1,2,3]; console.log(a);`),
      `console.log([1, 2, 3]);`
    );
  });
  test("propgation of an identifier", () => {
    assert, strictEqual(deobfuscate(`var i = q; var e = i(10); s = e;`), `s = q(10);`);
  });
  test("propgation of a call expression", () => {
    assert, strictEqual(deobfuscate(`var e = q(10); s = e;`), `s = q(10);`);
  });
});

describe("iife function", () => {
  test("iife function expression", () => {
    assert.strictEqual(
      deobfuscate(`(function () { console.log(5); })();`),
      `console.log(5);`
    );
  });
  test("iife arrow function expression", () => {
    assert.strictEqual(deobfuscate(`(() => { console.log(5); })();`), `console.log(5);`);
  });
});

describe("jsfuck notation", () => {
  test("array with empty values", () => {
    assert.strictEqual(deobfuscate(`+([[[[[[]], , ,]]]] != 0);`), `1;`);
  });
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

test("jsfuck expressions", () => {
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
