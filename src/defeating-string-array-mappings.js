import * as t from "@babel/types";

export default function defeatingStringArrayMapping(path) {
	if (!path.node.property) return;
	if (!t.isNumericLiteral(path.node.property)) return;

	let idx = path.node.property.value;

	let binding = path.scope.getBinding(path.node.object.name);
	if (!binding) return;
	
	if (t.isVariableDeclarator(binding.path.node)) {
		let array = binding.path.node.init;
		if (idx >= array.length) return;

		let member = array.elements[idx];

		if (t.isLiteral(member)) {
			path.replaceWith(member);
			// FIXME scope should be updated
		}
	}
}