exports.evaluate = function(object, property, arguments) {
	switch (property) {
		case "at": return ["StringLiteral", object.at(arguments[0].value)];
		case "charAt": return ["StringLiteral", object.charAt(arguments[0].value)];
		case "charCodeAt": return ["NumericLiteral", object.charCodeAt(arguments[0].value)];
		case "codePointAt": return ["NumericLiteral", object.codePointAt(arguments[0].value)];
		case "concat": return ["StringLiteral", object.concat(arguments[0].value)];
		case "endsWith":  if (arguments.length == 1) return object.endsWith(arguments[0].value); else return object.endsWith(arguments[0].value, arguments[1].value);
		case "fromCharCode": {
			let resultString;
			for(arg in arguments) {
				resultString += String.fromCharCode(arg)
			}
			return resultString;
		}
		case "fromCodePoint": {
			let resultString;
			for(arg in arguments) {
				resultString += String.fromCodePoint(arg);
			}
			return resultString;
		}
		case "includes": if (arguments.length == 1) return ["BooleanLiteral", object.includes(arguments[0].value)]; else return ["BooleanLiteral", object.includes(arguments[0].value, arguments[1].value)];
		case "indexOf": if (arguments.length == 1) return ["NumericLiteral", object.indexOf(arguments[0].value)]; else return ["NumericLiteral", object.indexOf(arguments[0].value, arguments[1].value)];
		case "isWellFormed": return object.isWellFormed(arguments[0].value);
		case "lastIndexOf": if (arguments.length == 1) return ["NumericLiteral", object.lastIndexOf(arguments[0].value)]; else return ["NumericLiteral", object.lastIndexOf(arguments[0].value, arguments[1].value)];
		case "localeCompare": {
			switch (arguments.length) {
				case 1: return object.localeCompare(arguments[0].value);
				case 2: return object.localeCompare(arguments[0].value, arguments[1].value);
				case 3: return object.localeCompare(arguments[0].value, arguments[1].value, arguments[2].value);
			}
		}
		case "match": return [arrType, object.match(arguments[0].value)];
		case "matchAll": return [arrType, object.matchAll(arguments[0].value)];
		case "normalize": if (arguments.length == 0) return ["StringLiteral", object.normalize()]; else return ["StringLiteral", object.lastIndexOf(arguments[0].value)];
		case "padEnd": if (arguments.length == 1) return ["StringLiteral", object.padEnd(arguments[0].value)]; else return ["StringLiteral", object.padEnd(arguments[0].value, arguments[1].value)];
		case "padStart": if (arguments.length == 1) return ["StringLiteral", object.padStart(arguments[0].value)]; else return ["StringLiteral", object.padStart(arguments[0].value, arguments[1].value)];
		case "raw": return; //FIXME
		case "repeat": return ["StringLiteral", object.repeat(arguments[0].value)];
		case "replace": return ["StringLiteral", object.replace(arguments[0].value, arguments[1].value)];
		case "replaceAll": return ["StringLiteral", object.replaceAll(arguments[0].value, arguments[1].value)];
		case "search": return ["NumericLiteral", object.search(arguments[0].value)];
		case "slice": if (arguments.length == 1) return ["StringLiteral", object.slice(arguments[0].value)]; else return ["StringLiteral", object.slice(arguments[0].value, arguments[1].value)];
		case "split": if (arguments.length == 1) return ["StringLiteral", object.split(arguments[0].value)]; else return ["StringLiteral", object.split(arguments[0].value, arguments[1].value)];
		case "startsWith": if (arguments.length == 1) return ["BooleanLiteral", object.startsWith(arguments[0].value)]; else return ["BooleanLiteral", object.startsWith(arguments[0].value, arguments[1].value)];
		case "substring": if (arguments.length == 1) return ["StringLiteral", object.substring(arguments[0].value)]; else return ["StringLiteral", object.substring(arguments[0].value, arguments[1].value)];
		case "toLocaleLowerCase": if (arguments.length == 0) return ["StringLiteral", object.toLocaleLowerCase()]; else return ["StringLiteral", object.toLocaleLowerCase(arguments[0].value)];
		case "toLocaleUpperCase": if (arguments.length == 0) return ["StringLiteral", object.toLocaleUpperCase()]; else return ["StringLiteral", object.toLocaleUpperCase(arguments[0].value)];
		case "toLowerCase": return object.toLowerCase();
		//case "toString": return object.toString();
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