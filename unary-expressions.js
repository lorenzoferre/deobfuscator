exports.evaluate = function(operator, prefix, value) {
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