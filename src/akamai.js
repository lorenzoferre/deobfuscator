import Deobfuscator from "./deobfuscator.js";
import babel from "@babel/core";
import _generate from "@babel/generator";
import * as t from "@babel/types";
const generate = _generate.default;
import fs from "fs";

/*
const basePath = "C:\\Users\\loren\\Downloads";
const akamaiCode = fs.readFileSync(`${basePath}\\akamai.js`, "utf-8");
*/

const basePath = "C:\\Users\\loren\\Desktop\\Progetti\\deobfuscator";
const akamaiCode = fs.readFileSync(`${basePath}\\obfuscatedExample.js`, "utf-8");

const akamaiVisitor = {
  ExpressionStatement(path) {
    const { node, scope } = path;
    const { expression } = node;
    if (!t.isAssignmentExpression(expression)) return;
    const { left, right } = expression;
    let binding = scope.getBinding(left.name);
    if (!binding) return;
    if (!t.isVariableDeclarator(binding.path.node)) return;
    if (binding.path.node.init !== null) return;
    if (binding.kind !== "var") return;
    if (expression !== binding.constantViolations.at(0).node) return;
    let { parentPath } = path.parentPath.parentPath;
    if (!parentPath) return;
    if (!t.isSwitchStatement(parentPath)) return;
    parentPath = parentPath.parentPath.parentPath;
    const declaration = t.variableDeclaration("var", [t.variableDeclarator(left, right)]);
    parentPath.insertBefore(declaration);
    binding.path.remove();
    path.remove();
  },
};

var ast = babel.parse(akamaiCode);
babel.traverse(ast, akamaiVisitor);
const code = generate(ast, { comments: false }).code;

const deobfuscator = new Deobfuscator(code);
const deobfuscatedCode = deobfuscator.deobfuscate();

//console.log(deobfuscatedCode);

fs.writeFileSync(`${basePath}\\deobfuscatedExample.js`, deobfuscatedCode);
