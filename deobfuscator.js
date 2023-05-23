var babel = require("@babel/core");
const code = "var a = 5+5";
const output = babel.transformSync(code, {
	plugins: [
		function evaluateStaticExpression() {
			const pattern = /(Numeric|String)Literal/;
			return {
				visitor: {
					BinaryExpression(path) {
						if (path.node.left.type.match(pattern) && path.node.right.type.match(pattern)) {
							if (path.node.left.type == "NumericLiteral" && path.node.right.type == "NumericLiteral")
								path.node.type = "NumericLiteral";
							else
								path.node.type = "StringLiteral";
							path.node.value = eval(path.node.left.extra.raw+path.node.operator+path.node.right.extra.raw);
						}
					}
				}
				
			}
		}
	]
});

console.log(output.code)