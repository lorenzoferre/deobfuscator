import * as t from "@babel/types";

export default function transformBracketToDot(path) {
	let { property } = path.node.callee;
	if (t.isStringLiteral(property)) {
		path.node.callee.property = t.identifier(property.value);
		path.node.callee.computed = false;
	}
}