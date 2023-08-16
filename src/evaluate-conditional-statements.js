export default function evaluateConditionalStatement(path) {
	let isTruthy = path.get("test").evaluateTruthy();
	let { consequent, alternate  } = path.node;

	if (isTruthy) {
		if (t.isBlockStatement(consequent)) {
			path.replaceWithMultiple(consequent.body);
		} else {
			path.replaceWith(consequent);
		}
	} else if (alternate != null) {
		if (t.isBlockStatement(alternate)) {
			path.replaceWithMultiple(alternate.body);
		} else {
			path.replaceWith(alternate);
		}
	} else {
		path.remove();
	}
}