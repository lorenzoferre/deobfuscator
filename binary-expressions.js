export function evalBinaryExpr(left, operator, right) {
	switch (operator) {
		case "+": return left + right;
		case "+=": return left += right;
		case "-": return left - right;
		case "-=": return left -= right;
		case "*": return left * right;
		case "*=": return left *= right;
		case "/": return left / right;
		case "/=": return left /= right;
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