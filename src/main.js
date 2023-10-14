import deobfuscate from "./deobfuscator.js";

const code = `
function AaA() {
  do {
    switch (AA) {
      case aa:
        {
          b = 2;
          c = b + b;
          d = c * 2;
          AA = d;
        }
        break;
      case ac:
        {
          aA = 10;
          bB = aA * 2;
          cC = bB / 5;
          fff(cC);
          AA = cC * 25;
        }
        break;
      case ab:
        {
          A = 3;
          B = A * 3;
          C = A * B;
          D = C + 2;
          E = D * 3;
          AA = E;
        }
        break;
    }
  } while (AA != ad);
}

var a, b, c, d, e, f, g, h, j, k, l, m, n, p;
var A, B, C, D, E, F, G, H, J, K, L, M, N, P;
var aA, bB, cC;
var aa = +!+[]; // => 1
var ab = +([!+[] + !+[] + !+[] + !+[] + !+[] + !+[] + !+[] + !+[]] + []); // => 8
var ac = 87;
var ad = 100;
var AA = +!![]; // => 1
var aaa = ["c", "a", "o", "n", "w"];
var bbb = ["l", "e", "y", "u", "s", "g"];
var ddd = aaa[0] + aaa[2] + aaa[3] + bbb[4] + aaa[2] + bbb[0] + bbb[1];
var eee = bbb[0] + aaa[2] + bbb[5];
var fff = eval(ddd)[eee];
AaA();
`;

const deobfuscatedCode = deobfuscate(code);
console.log(deobfuscatedCode);
