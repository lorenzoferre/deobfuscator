import { parse, traverse } from "@babel/core";
import _generate from "@babel/generator";
const generate = _generate.default;
import { evalBinaryExpr } from "./binary-expressions.js";
import { evalUnaryExpr } from "./unary-expressions.js";
import { evalStringProp } from "./string-properties.js";
import { evalNumberProp } from "./number-properties.js";

const pattern = /(Numeric|String|Boolean)Literal/;

function transformOperatorAssignment(path, operator) {
	
	switch (operator) {
		case "+=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "+";
			path.node.right.right = nodeRight;
		}
		case "-=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "-";
			path.node.right.right = nodeRight;
		}

		case "+=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "+";
			path.node.right.right = nodeRight;
		}

		case "*=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "*";
			path.node.right.right = nodeRight;
		}

		case "/=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "/";
			path.node.right.right = nodeRight;
		}

		case "%=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "%";
			path.node.right.right = nodeRight;
		}

		case "**=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "**";
			path.node.right.right = nodeRight;
		}

		case "<<=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "<<";
			path.node.right.right = nodeRight;
		}

		case ">>=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = ">>";
			path.node.right.right = nodeRight;
		}

		case ">>>=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = ">>>";
			path.node.right.right = nodeRight;
		}

		case "&=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "&";
			path.node.right.right = nodeRight;
		}

		case "^=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "^";
			path.node.right.right = nodeRight;
		}

		case "|=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "|";
			path.node.right.right = nodeRight;
		}

		case "&&=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "&&";
			path.node.right.right = nodeRight;
		}
		case "||=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "||";
			path.node.right.right = nodeRight;
		}

		case "??=": {
			path.node.operator = "=";
			let nodeRight = path.node.right;
			path.node.right = {};
			path.node.right.type = "BinaryExpression";
			path.node.right.left = path.node.left;
			path.node.right.operator = "??";
			path.node.right.right = nodeRight;
		}
	}
}

function doConstantPropagation(path) {
	const binding = path.scope.bindings[path.node.name];
	path.node.type = binding.path.node.init.type;
	delete path.node.name;
	path.node.value = binding.path.node.init.value
}

function doEvalBinaryExpr(path) {
	if (path.node.left.type == "ArrayExpression" || path.node.right.type == "ArrayExpression") {
		let value;
		if (path.node.left.type == "ArrayExpression" && path.node.right.type == "ArrayExpression") {
			if (path.node.left.elements.length == 1 && path.node.right.elements.length == 1) {
				value = evalBinaryExpr([path.node.left.elements[0].value], path.node.operator, [path.node.right.elements[0].value]);
			}

		} else if (path.node.left.type == "ArrayExpression") {
			if (path.node.left.elements.length == 1) {
				value = evalBinaryExpr([path.node.left.elements[0].value], path.node.operator, path.node.right.value);
			}
		} else {
			if (path.node.right.elements.length == 1) {
				value = evalBinaryExpr(path.node.left.value, path.node.operator, [path.node.right.elements[0].value]);
			}
		}
		path.node.type = "StringLiteral";
		path.node.value = value;
	}
	

	if (path.node.left.type.match(pattern) && path.node.right.type.match(pattern)) {
		let value = evalBinaryExpr(path.node.left.value, path.node.operator, path.node.right.value);
		if ( (path.node.left.type == "NumericLiteral" || path.node.left.type == "BooleanLiteral") && (path.node.right.type == "NumericLiteral" || path.node.right.type == "BooleanLiteral")) {
			path.node.type = "NumericLiteral";
			//path.node.extra = {"rawValue": value, "raw": `${value}`};
		}

		if (path.node.left.type == "StringLiteral" || path.node.right.type == "StringLiteral") {
			path.node.type = "StringLiteral";
			//path.node.extra = {"rawValue": value, "raw": `"${value}"`};
		}
		delete path.node.left;
		delete path.node.operator
		delete path.node.right;
		path.node.value = value;
	}

	if (path.node.operator == "in") {
		let obj = {};
		for(const property in path.node.right.properties) {
			const key = path.node.right.properties[property].key.value;
			const value = path.node.right.properties[property].value.value;
			if (path.node.right.properties[property].value.type == "StringLiteral")
				obj[`${key}`] = `${value}`;
			else if (path.node.right.properties[property].value.type == "NumericLiteral")
				obj[`${key}`] = value;
		}
		let value = evalBinaryExpr(path.node.left.value, path.node.operator, obj)
		path.node.type = "BooleanLiteral";
		delete path.node.left;
		delete path.node.operator;
		delete path.node.right;
		path.node.value = value;
	}
}

function doEvalLogicalExpr(path) {
	let value = evalBinaryExpr(path.node.left.value, path.node.operator, path.node.right.value);
	if (path.node.operator == "??") {
		if (value == null)
			path.node.type = "NullLiteral";
		else
			path.node.type = path.node.right.type
	} else
		path.node.type = "BooleanLiteral";
	delete path.node.left;
	delete path.node.operator;
	delete path.node.right;
	path.node.value = value;
}

function doEvalUnaryExpr(path) {
				
	if (path.node.argument.type == "ArrayExpression") {
		if (path.node.argument.elements.length == 0) {
			path.node.argument.type = "NumericLiteral";
			path.node.argument.value = 0;
		}
	}
	
	if (path.node.argument.type.match(pattern)) {
		let value = evalUnaryExpr(path.node.operator, path.node.prefix, path.node.argument.value)
		path.node.type = path.node.argument.type;
		path.node.value = value
		delete path.node.operator
		delete path.node.prefix;
		delete path.node.argument;
	}
}

function doEvalNumberProp(path) {
	if (path.node.callee.type == "MemberExpression") {
		const [ type, value ] = evalNumberProp(path.node.callee.property.name, path.node.arguments);
		path.node.type = type;
		delete path.node.callee;
		delete path.node.arguments;
		path.node.value = value;
		
	}
}

// delete start, end and loc fields

function deleteIrrelevantFields(ast) {
	traverse(ast, {
		exit(path) {
			delete path.node.start;
			delete path.node.end;
			delete path.node.loc;
			delete path.node.extra;
		}
	});
}

export function deobfuscate(code) {
	var ast = parse(code);
	deleteIrrelevantFields(ast);
	traverse(ast, {
		exit(path) {
			
			if (path.node.type == "AssignmentExpression") {
				transformOperatorAssignment(path, path.node.operator);
			}
	
			// constant propagation
			if (path.isReferencedIdentifier() && path.node.name != "Number") {
				doConstantPropagation(path);
			}

			if (path.node.type == "LogicalExpression") {
				doEvalLogicalExpr(path);
			}
	
			if (path.node.type == "BinaryExpression") {
				doEvalBinaryExpr(path);
			}
	
			if (path.node.type == "UnaryExpression") {
				doEvalUnaryExpr(path);
			}
	
			/*
			
			if (path.node.type == "CallExpression") {
				let value;
				if (path.node.callee.type == "MemberExpression") {
					const [ type, value ] = evalStringProp(path.node.callee.object.value, path.node.callee.property.name, path.node.arguments);
					path.node.type = type;
					delete path.node.callee;
					delete path.node.arguments;
					path.node.value = value;
					
				}
			}*/
		}
	
	});
	const output = generate(ast);
	return output.code
}

const code = 
`
null ?? "hi";
`;
const codeDeobfuscated = deobfuscate(code);
console.log(codeDeobfuscated);