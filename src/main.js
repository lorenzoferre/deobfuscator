import Deobfuscator from "./deobfuscator.js"
const code =
`
console.log(+([[[[[[]], , ,]]]] != 0));
`;

const deobfuscator = new Deobfuscator(code);
const deobfuscatedCode = deobfuscator.deobfuscate();
console.log(deobfuscatedCode);