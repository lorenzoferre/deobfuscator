export function evalNumberProp(property, args) {
	switch (property) {
		case "isFinite": if (args.length == 0) return ["BooleanLiteral", isFinite()]; else return ["BooleanLiteral", isFinite(args[0].value)];
		case "isInteger": return ["BooleanLiteral", Number.isInteger()];
		case "isNan": return ["BooleanLiteral", Number.isNan()];
		case "isSafeInteger": return ["BooleanLiteral", Number.isSafeInteger()];
		case "parseFLoat": return ["NumericLiteral", Number.parseFloat(args[0].value)];
		case "parseInt": return ["NumericLiteral", Number.parseInt(args[0].value)];
		
		case "toExponential": if (args.length == 0) return ["StringLiteral", Number.toExponential()]; else return ["StringLiteral", Number.toExponential(args[0].value)];
		case "toFixed": if (args.length == 0) return ["StringLiteral", Number.toFixed()]; else return ["StringLiteral", Number.toFixed(args[0].value)];
		case "toLocaleString": {
			switch (elements.length) {
				case 0: return ["StringLiteral", Number.toLocaleString()];
				case 1: return ["StringLiteral", Number.toLocaleString(args[0].value)];
				case 2: return ["StringLiteral", Number.toLocaleString(args[0].value, args[1].value)];
			}
		}
		case "toPrecision": if (args.length == 0) return ["StringLiteral", Number.toPrecision()]; else return ["StringLiteral", Number.toPrecision(args[0].value)];
		case "toString": if (args.length == 0) return ["StringLiteral", Number.toString()]; else return ["StringLiteral", Number.toString(args[0].value)];
		case "valueOf": return object.valueOf();
	}
}
