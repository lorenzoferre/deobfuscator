export default function renameVariableSameScope(path) {
	let idName = path.node.id.name;
	let parentScope = path.scope.parent;
	if (!parentScope) return;
	for (let binding in parentScope.bindings) {
		if (binding == idName) {
			let newName = path.scope.generateUidIdentifier(idName);
			path.scope.rename(idName, newName.name);
		}
	}
}