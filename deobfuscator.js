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
var d = !true;
var e = +"41";
`;

var ast = babel.parse(code);

const pattern = /(Numeric|String|Boolean)Literal/;

// delete start, end and loc fields
babel.traverse(ast, {
	enter(path) {
		delete path.node.start;
		delete path.node.end;
		delete path.node.loc;
	}
})

// evaluation binary expressions

babel.traverse(ast, {
	exit(path) {

		// constant propagation
		if (path.isReferencedIdentifier()) {
			const binding = path.scope.bindings[path.node.name];
			Object.assign(path.node, binding.path.node.init);
		}

		if (path.node.type == "BinaryExpression") {
			if (path.node.left.type.match(pattern) && path.node.right.type.match(pattern)) {
				let value = evaluateBinaryExpression(path.node.left.value, path.node.operator, path.node.right.value);
				if ( (path.node.left.type == "NumericLiteral" || path.node.left.type == "BooleanLiteral") && (path.node.right.type == "NumericLiteral" || path.node.right.type == "BooleanLiteral")) {
					path.node.type = "NumericLiteral";
					path.node.extra = {"rawValue": value, "raw": `${value}`};
				}
				if (path.node.left.type == "StringLiteral" || path.node.right.type == "StringLiteral") {
					path.node.type = "StringLiteral";
					path.node.extra = {"rawValue": value, "raw": `"${value}"`};
				}
				delete path.node.left;
				delete path.node.operator
				delete path.node.right;
				path.node.value = value;
			}
		}

		if (path.node.type == "UnaryExpression") {
			let value = evaluateUnaryExpression(path.node.operator, path.node.prefix, path.node.argument.value)
			path.node.type = path.node.argument.type;
			path.node.value = value;
			delete path.node.operator
			delete path.node.prefix
			delete path.node.argument;
			console.log(path.node);
		}
	}

});

const output = generate(ast);
console.log(output.code);