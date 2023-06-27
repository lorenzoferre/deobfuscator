import { parse, transform, traverse } from "@babel/core";
import * as t from "@babel/types";
import _generate from "@babel/generator";
const generate = _generate.default;
import { globalFunctions } from "./built-ins.js";
import { isFunctionExpression } from "@babel/types";

var ast;

// delete start, end and loc fields
function deleteIrrelevantFields() {
	traverse(ast, {
		exit(path) {
			delete path.node.start;
			delete path.node.end;
			delete path.node.loc;
			delete path.node.extra;
		}
	});
}

// delete unreachable functions
function deleteUnreachableFunctions() {
	let removed;
	do {
		removed = false;
		traverse(ast, {
			FunctionDeclaration(path) {
				if (!path.scope.getBinding(path.node.id.name).referenced) {
					path.remove();
					removed = true;
				}
			}
		});
		ast = parse(generate(ast, {comments: false}).code);
	} while (removed > 0);
}

function evaluateConditionalStatement(path) {
	let isTruthy = path.get("test").evaluateTruthy();
	let node = path.node;

	if (isTruthy) {
		if (t.isBlockStatement(node.consequent)) {
			path.replaceWithMultiple(node.consequent.body);
		} else {
			path.replaceWith(node.consequent);
		}
	} else if (node.alternate != null) {
		if (t.isBlockStatement(node.alternate)) {
			path.replaceWithMultiple(node.alternate.body);
		} else {
			path.replaceWith(node.alternate);
		}
	} else {
		path.remove();
	}
}

function defeatingStringArrayMapping(path) {
	if (!path.node.property) return;
	if (!t.isNumericLiteral(path.node.property)) return;

	let idx = path.node.property.value;

	let binding = path.scope.getBinding(path.node.object.name);
	if (!binding) return;
	
	if (t.isVariableDeclarator(binding.path.node)) {
		let array = binding.path.node.init;
		if (idx >= array.length) return;

		let member = array.elements[idx];

		if (t.isLiteral(member)) {
			path.replaceWith(member);
			// FIXME scope should be updated
		}
	}
}

function defeatingMapArrayMapping(path) {
	if (!path.node) return;
	let node = path.node;
	if (!node.init) return;
	if (!t.isObjectExpression(node.init)) return;
	let binding = path.scope.getBinding(node.id.name);
	if (!binding.constant) return;
	let properties = node.init.properties;
	if (!properties) return;
	
	let kv = new Object();
	
	for (let prop of properties) {
		if (!t.isIdentifier(prop.key) && !t.isStringLiteral(prop.key)) return;
		let key;
		if (t.isIdentifier(prop.key))
			key = prop.key.name;
		if (t.isStringLiteral(prop.key))
			key = prop.key.value;
		if (!t.isFunctionExpression(prop.value) && !t.isLiteral(prop.value)) return;
		let value = prop.value;
		kv[key] = value;
	}
	
	for (let refPath of binding.referencePaths) {
		if (!refPath.parentPath) return;
		let parentNode = refPath.parentPath.node;
		if (!t.isMemberExpression(parentNode)) return;
		let key = parentNode.property.name;
		if (!key)
			key = parentNode.property.value;
		let value = kv[key];
		if (t.isLiteral(value)) {
			refPath.parentPath.replaceWith(value);
		} else if (t.isFunctionExpression(value)) {
			let fnName = key;
			let functionDecl = t.functionDeclaration(
			  t.identifier(key),
			  value.params,
			  value.body,
			  value.generator,
			  value.async
			);
			
			let parentOfDecl = path.parentPath.parentPath;
			parentOfDecl.unshiftContainer("body", functionDecl);
			refPath.parentPath.replaceWith(t.identifier(fnName)); 
		}
	}
	path.remove();
}

function costantPropagation(path) {
	if (!path.node) return;
	if (!path.node.init) return;
	if (!t.isLiteral(path.node.init)) return;
	const binding = path.scope.getBinding(path.node.id.name);
	if (!binding.constant) return;
	for (let refPath of binding.referencePaths) {
	  refPath.replaceWith(path.node.init);
	}
	path.remove();
}

function transformBracketToDot(path) {
	let property = path.node.callee.property;
	if (t.isStringLiteral(property)) {
		path.node.callee.property = t.identifier(property.value);
		path.node.callee.computed = false;
	}
}

function renameVariablesSameScope(path) {
	let idName = path.node.id.name;
	let parentScope = path.scope.parent;
	if (!parentScope) return;
	for (let binding in parentScope.bindings) {
		if (binding == idName) {
			let newName = path.scope.generateUidIdentifier(idName);
			path.scope.rename(idName, newName.name);
		}
	}
}

function replaceOutermostIife(path) {
	if (!t.isProgram(path.parent)) return;
	let node = path.node;
	let expr = node.expression;
	if (!t.isCallExpression(expr)) return;
	let callee = expr.callee;
	if (!t.isFunctionExpression(callee)) return;
	let innerStatements = callee.body.body;
	path.replaceWithMultiple(innerStatements);
}

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

function evaluate(path) {
	// evaluate globalFunctions
	if (t.isCallExpression(path)) {
		let calleeName = path.node.callee.name;
		if (globalFunctions.has(calleeName)) {
			path.node.callee = globalFunctions.get(calleeName)();
		}
	}
	let evaluated = path.evaluate();
	if (!evaluated) return;
	if (!evaluated.confident) return;
	
	let value = evaluated.value;
	let valueNode = t.valueToNode(value);

	// NaN and infinity values generates a binary expression
	if (t.isBinaryExpression(valueNode) && t.isNumericLiteral(valueNode.left) && t.isNumericLiteral(valueNode.right)) {
		if (valueNode.right.value === 0) {
			if (valueNode.left.value === 1) {
				path.replaceWith(t.identifier("Infinity"));
				return;
			} else if (valueNode.left.value === 0) {
				path.replaceWith(t.identifier("NaN"));
				return;
			}
		}
	}
	// valueToNode  return an unary expression when value is < 0 
	if (t.isUnaryExpression(valueNode) && value < 0) {
		valueNode = t.numericLiteral(value);
	}
	if (t.isLiteral(valueNode)) {
		path.replaceWith(valueNode);
	} 
	if (t.isArrayExpression(valueNode)) {
		for(let element of valueNode.elements) {
			if (!t.isLiteral(element)) return;
		}
		path.replaceWith(valueNode);
	}
}

export function deobfuscate(code) {
	ast = parse(code);
	deleteUnreachableFunctions();
	deleteIrrelevantFields();
	traverse(ast, {
		exit(path) {
			// costant propagation
			if (t.isVariableDeclarator(path)) {
				renameVariablesSameScope(path);
				defeatingMapArrayMapping(path);
				costantPropagation(path);
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
console.log([+!+[]]+[+[]]);
`;
const cleanCode = deobfuscate(code);
console.log(cleanCode);