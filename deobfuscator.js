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

const strType = "StringLiteral";
const numType = "NumericLiteral";
const boolType = "BooleanLiteral";
const arrType = "ArrayExpression";

function evaluateStringProperty(object, property, arguments) {
	switch (property) {

		//String property
	
		case "at": return [strType, object.at(arguments[0].value)];
		case "charAt": return [strType, object.charAt(arguments[0].value)];
		case "charCodeAt": return [numType, object.charCodeAt(arguments[0].value)];
		case "codePointAt": return [numType, object.codePointAt(arguments[0].value)];
		case "concat": return [strType, object.concat(arguments[0].value)];
		case "endsWith":  if (arguments.length == 1) return object.endsWith(arguments[0].value); else return object.endsWith(arguments[0].value, arguments[1].value);
		case "fromCharCode": {
			let resultString;
			for(arg in arguments) {
				resultString += object.fromCharCode(arg)
			}
			return resultString;
		}
		case "fromCodePoint": {
			let resultString;
			for(arg in arguments) {
				resultString += object.fromCodePoint(arg);
			}
			return resultString;
		}
		case "includes": if (arguments.length == 1) return [boolType, object.includes(arguments[0].value)]; else return [boolType, object.includes(arguments[0].value, arguments[1].value)];
		case "indexOf": if (arguments.length == 1) return [numType, object.indexOf(arguments[0].value)]; else return [numType, object.indexOf(arguments[0].value, arguments[1].value)];
		case "isWellFormed": return object.isWellFormed(arguments[0].value);
		case "lastIndexOf": if (arguments.length == 1) return [numType, object.lastIndexOf(arguments[0].value)]; else return [numType, object.lastIndexOf(arguments[0].value, arguments[1].value)];
		case "localeCompare": {
			switch (arguments.length) {
				case 1: return object.localeCompare(arguments[0].value);
				case 2: return object.localeCompare(arguments[0].value, arguments[1].value);
				case 3: return object.localeCompare(arguments[0].value, arguments[1].value, arguments[2].value);
			}
		}
		case "match": return [arrType, object.match(arguments[0].value)];
		case "matchAll": return [arrType, object.matchAll(arguments[0].value)];
		case "normalize": if (arguments.length == 0) return [strType, object.normalize()]; else return [strType, object.lastIndexOf(arguments[0].value)];
		case "padEnd": if (arguments.length == 1) return [strType, object.padEnd(arguments[0].value)]; else return [strType, object.padEnd(arguments[0].value, arguments[1].value)];
		case "padStart": if (arguments.length == 1) return [strType, object.padStart(arguments[0].value)]; else return [strType, object.padStart(arguments[0].value, arguments[1].value)];
		case "raw": return;
		case "repeat": return [strType, object.repeat(arguments[0].value)];
		case "replace": return [strType, object.replace(arguments[0].value, arguments[1].value)];
		case "replaceAll": return [strType, object.replaceAll(arguments[0].value, arguments[1].value)];
		case "search": return [numType, object.search(arguments[0].value)];
		case "slice": if (arguments.length == 1) return [strType, object.slice(arguments[0].value)]; else return [strType, object.slice(arguments[0].value, arguments[1].value)];
		case "split": if (arguments.length == 1) return [strType, object.split(arguments[0].value)]; else return [strType, object.split(arguments[0].value, arguments[1].value)];
		case "startsWith": if (arguments.length == 1) return [boolType, object.startsWith(arguments[0].value)]; else return [boolType, object.startsWith(arguments[0].value, arguments[1].value)];
		case "substring": if (arguments.length == 1) return [strType, object.substring(arguments[0].value)]; else return [strType, object.substring(arguments[0].value, arguments[1].value)];
		case "toLocaleLowerCase": if (arguments.length == 0) return [strType, object.toLocaleLowerCase()]; else return [strType, object.toLocaleLowerCase(arguments[0].value)];
		case "toLocaleUpperCase": if (arguments.length == 0) return [strType, object.toLocaleUpperCase()]; else return [strType, object.toLocaleUpperCase(arguments[0].value)];
		case "toLowerCase": return object.toLowerCase();
		case "toString": return object.toString();
		case "toUpperCase": return object.toUpperCase();
		case "toWellFormed":return object.toWellFormed();
		case "trim": return object.trim();
		case "trimEnd": return object.trimEnd();
		case "trimRight": return object.trimEnd();
		case "trimStart": return object.trimStart();
		case "trimLeft": return object.trimStart();
		case "valueOf": return object.valueOf();
	}
}

function evaluateNumberProperty(object, property, arguments) {
	switch (property) {
		case "isFinite": return [boolType, object.isFinite()];
		case "isInteger": return [boolType, object.isInteger()];
		case "isNan": return [boolType, object.isNan()];
		case "isSafeInteger": return [boolType, object.isSafeInteger()];
		case "parseFLoat": return [numType, object.parseFloat(arguments[0].value)];
		case "parseInt": return [numType, object.parseInt(arguments[0].value)];
		
		case "toExponential": if (arguments.length == 0) return [strType, object.toExponential()]; else return [strType, object.toExponential(arguments[0].value)];
		case "toFixed": if (arguments.length == 0) return [strType, object.toFixed()]; else return [strType, object.toFixed(arguments[0].value)];
		case "toLocaleString": {
			switch (elements.length) {
				case 0: return [strType, object.toLocaleString()];
				case 1: return [strType, object.toLocaleString(arguments[0].value)];
				case 2: return [strType, object.toLocaleString(arguments[0].value, arguments[1].value)];
			}
		}
		case "toPrecision": if (arguments.length == 0) return [strType, object.toPrecision()]; else return [strType, object.toPrecision(arguments[0].value)];
		case "toString": if (arguments.length == 0) return [strType, object.toString()]; else return [strType, object.toString(arguments[0].value)];
		case "valueOf": return object.valueOf();
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
var k = "hello";
k.replace('h','hh');
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

		if (path.node.type == "CallExpression") {
			let value;
			if (path.node.callee.type == "MemberExpression") {
				if (path.node.callee.object.type == "StringLiteral") {
					[type, value] = evaluateStringProperty(path.node.callee.object.value, path.node.callee.property.name, path.node.arguments);
					path.node.type = type;
					delete path.node.callee;
					delete path.node.arguments;
					path.node.value = value;
				}					
			}
		}
	}

});

const output = generate(ast);
console.log(output.code);