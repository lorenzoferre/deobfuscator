import Deobfuscator from "./deobfuscator.js";

const code = `
console.log(parseInt("41"));
`;

const deobfuscator = new Deobfuscator(code);
const deobfuscatedCode = deobfuscator.deobfuscate();
console.log(deobfuscatedCode);
