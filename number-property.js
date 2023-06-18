exports.evaluate = function(property, arguments) {
	switch (property) {
		case "isFinite": return [boolType, Number.isFinite()];
		case "isInteger": return [boolType, Number.isInteger()];
		case "isNan": return [boolType, Number.isNan()];
		case "isSafeInteger": return [boolType, Number.isSafeInteger()];
		case "parseFLoat": return [numType, Number.parseFloat(arguments[0].value)];
		case "parseInt": return [numType, Number.parseInt(arguments[0].value)];
		
		case "toExponential": if (arguments.length == 0) return [strType, Number.toExponential()]; else return [strType, Number.toExponential(arguments[0].value)];
		case "toFixed": if (arguments.length == 0) return [strType, Number.toFixed()]; else return [strType, Number.toFixed(arguments[0].value)];
		case "toLocaleString": {
			switch (elements.length) {
				case 0: return [strType, Number.toLocaleString()];
				case 1: return [strType, Number.toLocaleString(arguments[0].value)];
				case 2: return [strType, Number.toLocaleString(arguments[0].value, arguments[1].value)];
			}
		}
		case "toPrecision": if (arguments.length == 0) return [strType, Number.toPrecision()]; else return [strType, Number.toPrecision(arguments[0].value)];
		case "toString": if (arguments.length == 0) return [strType, Number.toString()]; else return [strType, Number.toString(arguments[0].value)];
		case "valueOf": return object.valueOf();
	}
}
