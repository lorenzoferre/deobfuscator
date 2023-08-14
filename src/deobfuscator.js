import { parse, traverse } from "@babel/core";
import * as t from "@babel/types";
import _generate from "@babel/generator";
const generate = _generate.default;

import deleteIrrelevantFields from "./delete-irrelevant-fields.js";
import deleteUnreachableFunctions from "./delete-unreachable-functions.js";
import renameVariableSameScope from "./rename-variables-same-scope.js";
import defeatingMapArrayMapping from "./defeating-map-array-mappings.js";
import costantFolding from "./costant-folding.js";
import evaluate from "./evaluate.js";
import defeatingStringArrayMapping from "./defeating-string-array-mappings.js";
import transformBracketToDot from "./transform-from-brackets-to-dots.js";
import evaluateConditionalStatement from "./evaluate-conditional-statements.js";
import replaceOutermostIife from "./replace-outermost-iifes.js";


// var ast;

function unflatteningSwitch(path) {
	let loopStmt = path.node;
	let bodyBlock = loopStmt.body;
	let bodyParts = bodyBlock.body;
	if (bodyParts.length == 0) return;
	if (!t.isSwitchStatement(bodyParts[0])) return;
	let switchStmt = bodyParts[0];
	let switchCases = switchStmt.cases;
	
	let basicBlocksByCase = {};
	
	for (let switchCase of switchCases) {
	  let key = switchCase.test.value;
	  basicBlocksByCase[key] = switchCase.consequent;
	}
	
	let discriminantIdentifier = switchStmt.discriminant.name;
	let parentScope = path.parentPath.scope;
	let binding = parentScope.getBinding(discriminantIdentifier);
	
	let discriminantValue = binding.path.node.init.value;
  
	// it must be finished
}

export function deobfuscate(code) {
	let ast = parse(code);
	deleteUnreachableFunctions(ast);
	deleteIrrelevantFields(ast);
	traverse(ast, {
		exit(path) {
			// costant propagation
			if (t.isVariableDeclarator(path)) {
				renameVariableSameScope(path);
				defeatingMapArrayMapping(path);
				costantFolding(path);
			}
			// evaluate expression with constant values
			if (t.isBinaryExpression(path) ||
				t.isUnaryExpression(path) ||
				t.isLogicalExpression(path)) {
				evaluate(path);
			}
			// defeating literal array mappings
			if (t.isMemberExpression(path)) {
				defeatingStringArrayMapping(path);
			}
			// transform bracket notation into dot notation
			if (t.isCallExpression(path)) {
				// ADD function for reversing jsfuck notation with vm module
				transformBracketToDot(path);
				evaluate(path);
			}
			// evaluate if and ternary statementss
			if (t.isIfStatement(path) || t.isConditionalExpression(path)) {
				evaluateConditionalStatement(path);
			}
			// control flow unflattening
			/*
			if (t.isWhileStatement(path) || t.isForStatement(path)) {
				unflatteningSwitch(path);
			}*/
			// replace outermost iife with all code inside it
			if (t.isExpressionStatement(path)) {
				replaceOutermostIife(path);
			}
			// removes empty statement
			if (t.isEmptyStatement(path.node)) {
				path.remove();
			}
		}
	
	});

	const output = generate(ast, {comments: false});
	return output.code
}

const code = 
`
var a = "a|b|c";
console.log(a.split("|"));
`;
const cleanCode = deobfuscate(code);
console.log(cleanCode);