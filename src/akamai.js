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
    const binding = scope.getBinding(left.name);
    if (!binding) return;
    if (!t.isVariableDeclarator(binding.path.node)) return;
    if (binding.path.node.init !== null) return;
    if (binding.kind !== "var") return;
    if (binding.constantViolations.length !== 1) return;
    if (expression !== binding.constantViolations[0].node) return;
    const switchStatementPath = path.findParent(path => path.isSwitchStatement());
    if (!switchStatementPath) return;
    const loopStatementPath = switchStatementPath.findParent(
      path => path.isWhileStatement() || path.isDoWhileStatement()
    );
    if (!loopStatementPath) return;
    const declaration = t.variableDeclaration("var", [t.variableDeclarator(left, right)]);
    loopStatementPath.insertBefore(declaration);
    binding.path.remove();
    path.remove();
  },
};

var ast = babel.parse(akamaiCode);
babel.traverse(ast, akamaiVisitor);
const code = generate(ast, { comments: false }).code;

const deobfuscator = new Deobfuscator(code);
const deobfuscatedCode = deobfuscator.deobfuscate();

fs.writeFileSync(`${basePath}\\deobfuscatedExample.js`, deobfuscatedCode);
