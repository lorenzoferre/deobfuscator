var babel = require("@babel/core");
var generate = require("@babel/generator").default;

function evaluateBinaryExpression(left, operator, right) {
	switch (operator) {
		case "+": return left + right;
		case "+=": return left += right;
		case "-": return left - right;
		case "-=": return left -= right;
		case "*": return left * right;
		case "*=": return left *= right;
		case "/": return left / right;
		case "=/": return left /= right;
		case "%": return left % right;
		case "%=": return left %= right;
		case "**": return left ** right;
		case "**=": return left **= right;
		case "<<": return left << right;
		case "<<=": return left <<= right;
		case ">>": return left >> right;
		case ">>=": return left >>= right;
		case ">>>": return left >>> right;
		case ">>>=": return left >>>= right;
		case "&": return left & right;
		case "&=": return left &= right;
		case "^": return left ^ right;
		case "^=": return left ^= right;
		case "|": return left | right;
		case "|=": return left |= right;
		case "&&": return left && right;
		case "&&=": return left &&= right;
		case "||": return left || right;
		case "||=": return left ||= right;
		case "??": return left ?? right;
		case "??=": return left ??= right;

		case "==": return left == right;
		case "!=": return left != right;
		case "===": return left === right;
		case "!==": return left !== right;
		case ">": return left > right;
		case ">=": return left >= right;
		case "<": return left < right;
		case "<=": return left <= right;

		case "instanceof": return left instanceof right;
		case "in": return left in right;
	}
}

function evaluateUnaryExpression(operator, prefix, value) {
	switch (operator) {
		case "typeof": return typeof value
		case "+": return +value;
		case "-": return -value;
		case "!": return !value;
		case "~": return ~value;
		case "delete": return delete value;
		case "void": return void value;
		case "--": if (prefix) return --value; else return value--;
		case "++": if (prefix) return ++value; else return value++
	}
}

const code = 
`
function add() {
	let a = 3**3;
}
var a = 5 + 5 + 3 + 4;
var b = a + 2;
var c = a + b;
var d = 'h' + 'e';
var e = true + true;
var f = true + 's';
var g = !true;
var h = +!+[];
var i = [+!+[]]+[+[]];
var j = 1+[0];
`;

var ast = babel.parse(code);

const pattern = /(Numeric|String|Boolean)Literal/;

// delete start, end and loc fields
babel.traverse(ast, {
	enter(path) {
		delete path.node.start;
		delete path.node.end;
		delete path.node.loc;
		delete path.node.extra
	}
})

// evaluation binary expressions

babel.traverse(ast, {
	exit(path) {

		// constant propagation
		if (path.isReferencedIdentifier()) {
			const binding = path.scope.bindings[path.node.name];
			path.node.type = binding.path.node.init.type;
			delete path.node.name;
			path.node.value = binding.path.node.init.value
		}

		if (path.node.type == "BinaryExpression") {

			if (path.node.left.type == "ArrayExpression" || path.node.right.type == "ArrayExpression") {
				let value;
				if (path.node.left.type == "ArrayExpression" && path.node.right.type == "ArrayExpression") {
					if (path.node.left.elements.length == 1 && path.node.right.elements.length == 1) {
						value = evaluateBinaryExpression([path.node.left.elements[0].value], path.node.operator, [path.node.right.elements[0].value]);
					}

				} else if (path.node.left.type == "ArrayExpression") {
					if (path.node.left.elements.length == 1) {
						value = evaluateBinaryExpression([path.node.left.elements[0].value], path.node.operator, path.node.right.value);
					}
				} else {
					if (path.node.right.elements.length == 1) {
						value = evaluateBinaryExpression(path.node.left.value, path.node.operator, [path.node.right.elements[0].value]);
					}
				}
				path.node.type = "StringLiteral";
				path.node.value = value;
			}
			

			if (path.node.left.type.match(pattern) && path.node.right.type.match(pattern)) {
				let value = evaluateBinaryExpression(path.node.left.value, path.node.operator, path.node.right.value);
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
		}

		if (path.node.type == "UnaryExpression") {
			
			if (path.node.argument.type == "ArrayExpression") {
				if (path.node.argument.elements.length == 0) {
					path.node.argument.type = "NumericLiteral";
					path.node.argument.value = 0;
				}
			}
			
			if (path.node.argument.type.match(pattern)) {
				let value = evaluateUnaryExpression(path.node.operator, path.node.prefix, path.node.argument.value)
				path.node.type = path.node.argument.type;
				path.node.value = value
				delete path.node.operator
				delete path.node.prefix;
				delete path.node.argument;
			}
		}
	}

});

const output = generate(ast);
console.log(output.code);