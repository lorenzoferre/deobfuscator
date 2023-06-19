export function evalNumberProp(property, args) {
	switch (property) {
		case "isFinite": return [boolType, Number.isFinite()];
		case "isInteger": return [boolType, Number.isInteger()];
		case "isNan": return [boolType, Number.isNan()];
		case "isSafeInteger": return [boolType, Number.isSafeInteger()];
		case "parseFLoat": return [numType, Number.parseFloat(args[0].value)];
		case "parseInt": return [numType, Number.parseInt(args[0].value)];
		
		case "toExponential": if (args.length == 0) return [strType, Number.toExponential()]; else return [strType, Number.toExponential(args[0].value)];
		case "toFixed": if (args.length == 0) return [strType, Number.toFixed()]; else return [strType, Number.toFixed(args[0].value)];
		case "toLocaleString": {
			switch (elements.length) {
				case 0: return [strType, Number.toLocaleString()];
				case 1: return [strType, Number.toLocaleString(args[0].value)];
				case 2: return [strType, Number.toLocaleString(args[0].value, args[1].value)];
			}
		}
		case "toPrecision": if (args.length == 0) return [strType, Number.toPrecision()]; else return [strType, Number.toPrecision(args[0].value)];
		case "toString": if (args.length == 0) return [strType, Number.toString()]; else return [strType, Number.toString(args[0].value)];
		case "valueOf": return object.valueOf();
	}
}
