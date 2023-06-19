export function evalStringProp(object, property, args) {
	switch (property) {
		case "at": return ["StringLiteral", object.at(args[0].value)];
		case "charAt": return ["StringLiteral", object.charAt(args[0].value)];
		case "charCodeAt": return ["NumericLiteral", object.charCodeAt(args[0].value)];
		case "codePointAt": return ["NumericLiteral", object.codePointAt(args[0].value)];
		case "concat": return ["StringLiteral", object.concat(args[0].value)];
		case "endsWith":  if (args.length == 1) return object.endsWith(args[0].value); else return object.endsWith(args[0].value, args[1].value);
		case "fromCharCode": {
			let resultString;
			for(arg in args) {
				resultString += String.fromCharCode(arg)
			}
			return resultString;
		}
		case "fromCodePoint": {
			let resultString;
			for(arg in args) {
				resultString += String.fromCodePoint(arg);
			}
			return resultString;
		}
		case "includes": if (args.length == 1) return ["BooleanLiteral", object.includes(args[0].value)]; else return ["BooleanLiteral", object.includes(args[0].value, args[1].value)];
		case "indexOf": if (args.length == 1) return ["NumericLiteral", object.indexOf(args[0].value)]; else return ["NumericLiteral", object.indexOf(args[0].value, args[1].value)];
		case "isWellFormed": return object.isWellFormed(args[0].value);
		case "lastIndexOf": if (args.length == 1) return ["NumericLiteral", object.lastIndexOf(args[0].value)]; else return ["NumericLiteral", object.lastIndexOf(args[0].value, args[1].value)];
		case "localeCompare": {
			switch (args.length) {
				case 1: return object.localeCompare(args[0].value);
				case 2: return object.localeCompare(args[0].value, args[1].value);
				case 3: return object.localeCompare(args[0].value, args[1].value, args[2].value);
			}
		}
		case "match": return [arrType, object.match(args[0].value)];
		case "matchAll": return [arrType, object.matchAll(args[0].value)];
		case "normalize": if (args.length == 0) return ["StringLiteral", object.normalize()]; else return ["StringLiteral", object.lastIndexOf(args[0].value)];
		case "padEnd": if (args.length == 1) return ["StringLiteral", object.padEnd(args[0].value)]; else return ["StringLiteral", object.padEnd(args[0].value, args[1].value)];
		case "padStart": if (args.length == 1) return ["StringLiteral", object.padStart(args[0].value)]; else return ["StringLiteral", object.padStart(args[0].value, args[1].value)];
		case "raw": return; //FIXME
		case "repeat": return ["StringLiteral", object.repeat(args[0].value)];
		case "replace": return ["StringLiteral", object.replace(args[0].value, args[1].value)];
		case "replaceAll": return ["StringLiteral", object.replaceAll(args[0].value, args[1].value)];
		case "search": return ["NumericLiteral", object.search(args[0].value)];
		case "slice": if (args.length == 1) return ["StringLiteral", object.slice(args[0].value)]; else return ["StringLiteral", object.slice(args[0].value, args[1].value)];
		case "split": if (args.length == 1) return ["StringLiteral", object.split(args[0].value)]; else return ["StringLiteral", object.split(args[0].value, args[1].value)];
		case "startsWith": if (args.length == 1) return ["BooleanLiteral", object.startsWith(args[0].value)]; else return ["BooleanLiteral", object.startsWith(args[0].value, args[1].value)];
		case "substring": if (args.length == 1) return ["StringLiteral", object.substring(args[0].value)]; else return ["StringLiteral", object.substring(args[0].value, args[1].value)];
		case "toLocaleLowerCase": if (args.length == 0) return ["StringLiteral", object.toLocaleLowerCase()]; else return ["StringLiteral", object.toLocaleLowerCase(args[0].value)];
		case "toLocaleUpperCase": if (args.length == 0) return ["StringLiteral", object.toLocaleUpperCase()]; else return ["StringLiteral", object.toLocaleUpperCase(args[0].value)];
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