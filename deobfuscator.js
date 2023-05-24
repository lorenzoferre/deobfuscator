const babel = require("@babel/core");
const generate = require("@babel/generator").default;

function evaluation(left, operator, right) {
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

		//Miss unary operators


	}
}

const code = 
`var a = 5 + 5 + 3 + 4;
`;

const ast = babel.parse(code);

const pattern = /(Numeric|String)Literal/;

babel.traverse(ast, {
	exit(path) {
		if (path.node.type === "BinaryExpression") {
			if (path.node.left.type.match(pattern) && path.node.right.type.match(pattern)) {
				if (path.node.left.type === "NumericLiteral" && path.node.right.type === "NumericLiteral")
					path.node.type = "NumericLiteral";
				else
					path.node.type = "StringLiteral";
				path.node.value = evaluation(path.node.left.value, path.node.operator, path.node.right.value);
			}
		}
	}

});

const output = generate(ast);
console.log(output.code);