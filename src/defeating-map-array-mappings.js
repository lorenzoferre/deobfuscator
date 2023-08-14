import * as t from "@babel/types";

export default function defeatingMapArrayMapping(path) {
	if (!path.node) return;
	let node = path.node;
	if (!node.init) return;
	if (!t.isObjectExpression(node.init)) return;
	let binding = path.scope.getBinding(node.id.name);
	if (!binding.constant) return;
	let properties = node.init.properties;
	if (!properties) return;
	
	let kv = new Object();
	
	for (let prop of properties) {
		if (!t.isIdentifier(prop.key) && !t.isStringLiteral(prop.key)) return;
		let key;
		if (t.isIdentifier(prop.key))
			key = prop.key.name;
		if (t.isStringLiteral(prop.key))
			key = prop.key.value;
		if (!t.isFunctionExpression(prop.value) && !t.isLiteral(prop.value)) return;
		let value = prop.value;
		kv[key] = value;
	}
	
	for (let refPath of binding.referencePaths) {
		if (!refPath.parentPath) return;
		let parentNode = refPath.parentPath.node;
		if (!t.isMemberExpression(parentNode)) return;
		let key = parentNode.property.name;
		if (!key)
			key = parentNode.property.value;
		let value = kv[key];
		if (t.isLiteral(value)) {
			refPath.parentPath.replaceWith(value);
		} else if (t.isFunctionExpression(value)) {
			let fnName = key;
			let functionDecl = t.functionDeclaration(
			  t.identifier(key),
			  value.params,
			  value.body,
			  value.generator,
			  value.async
			);
			
			let parentOfDecl = path.parentPath.parentPath;
			parentOfDecl.unshiftContainer("body", functionDecl);
			refPath.parentPath.replaceWith(t.identifier(fnName)); 
		}
	}
	path.remove();
	path.stop();
}