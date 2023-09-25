import Deobfuscator from "./deobfuscator.js";
import fs from "fs";

/*
const basePath = "C:\\Users\\loren\\Downloads";
const akamaiCode = fs.readFileSync(`${basePath}\\akamai.js`, "utf-8");
*/

const basePath = "C:\\Users\\loren\\Desktop\\Progetti\\deobfuscator";
const akamaiCode = fs.readFileSync(`${basePath}\\obfuscatedExample.js`, "utf-8");

const deobfuscator = new Deobfuscator(akamaiCode);
const deobfuscatedCode = deobfuscator.deobfuscate();

fs.writeFileSync(`${basePath}\\deobfuscatedExample.js`, deobfuscatedCode);
