import { parse, traverse } from "@babel/core";
import * as t from "@babel/types";
import _generate from "@babel/generator";
const generate = _generate.default;
import { globalFunctions } from "./built-ins.js";

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
		removed = 0;
		traverse(ast, {
			FunctionDeclaration(path) {
				if (!path.scope.getBinding(path.node.id.name).referenced) {
					path.remove();
					removed++;
				}
			}
		});
		ast = parse(generate(ast).code);
	} while (removed > 0);
}

function evaluate(path) {
	// globalFunctions is not evaluated
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
	// valueToNode  return an unary expression when value is < 0 
	if (t.isUnaryExpression(valueNode) && value < 0) {
		valueNode = t.numericLiteral(value);
	}
	if (!t.isLiteral(valueNode) ) return;
	path.replaceWith(valueNode);
}

export function deobfuscate(code) {
	ast = parse(code);
	deleteUnreachableFunctions();
	deleteIrrelevantFields()
	traverse(ast, {
		exit(path) {

			// evaluate if and ternary statement
			if (t.isIfStatement(path) || t.isConditionalExpression(path)) {
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

			// defeating literal array mapping
			if (t.isMemberExpression(path)) {
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
					}
				}
			}
			
			// costant propagation
			if (t.isVariableDeclarator(path)) {
				if (path.node.init == null) return;
				if (!t.isLiteral(path.node.init)) return;
				const binding = path.scope.getBinding(path.node.id.name);
				if (!binding.constant) return;
				for (let i = 0; i < binding.referencePaths.length; i++) {
				  let refPath = binding.referencePaths[i];
				  refPath.replaceWith(path.node.init);
				}
				path.remove();
			}

			if (t.isCallExpression(path)) {
				// transform bracket notation into dot notation
				let property = path.node.callee.property;
				if (t.isStringLiteral(property)) {
					path.node.callee.property = t.identifier(property.value);
					path.node.callee.computed = false;
				}
			}
			
			if (t.isLogicalExpression(path) ||
				t.isBinaryExpression(path) ||
				t.isUnaryExpression(path) ||
				t.isAssignmentExpression(path) ||
				t.isCallExpression(path)) {
					evaluate(path);
			}

			if (t.isEmptyStatement(path.node)) {
				path.remove();
			}
		}
	
	});

	const output = generate(ast);
	return output.code
}

const code = 
`
var a = 5;
var c = a;
console.log(c)
`;
const cleanCode = deobfuscate(code);
console.log(cleanCode);