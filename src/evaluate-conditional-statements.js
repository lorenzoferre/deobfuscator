export default function evaluateConditionalStatement(path) {
	let isTruthy = path.get("test").evaluateTruthy();
	let node = path.node;

	if (isTruthy) {
		if (t.isBlockStatement(node.consequent)) {
			path.replaceWithMultiple(node.consequent.body);
		} else {
			path.replaceWith(node.consequent);
		}
	} else if (node.alternate != null) {
		if (t.isBlockStatement(node.alternate)) {
			path.replaceWithMultiple(node.alternate.body);
		} else {
			path.replaceWith(node.alternate);
		}
	} else {
		path.remove();
	}
}