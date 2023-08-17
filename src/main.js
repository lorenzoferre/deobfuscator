import Deobfuscator from "./deobfuscator.js"
const code =
`
-"1";
`;

const deobfuscator = new Deobfuscator(code);
const deobfuscatedCode = deobfuscator.deobfuscate();
console.log(deobfuscatedCode);