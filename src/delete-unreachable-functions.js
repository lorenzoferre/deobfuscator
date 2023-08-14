import { parse, traverse } from "@babel/core";
import _generate from "@babel/generator";
const generate = _generate.default;

export default function deleteUnreachableFunctions(ast) {
	let removed;
	do {
		removed = false;
		traverse(ast, {
			FunctionDeclaration(path) {
				if (!path.scope.getBinding(path.node.id.name).referenced) {
					path.remove();
					removed = true;
				}
			}
		});
		ast = parse(generate(ast, {comments: false}).code);
	} while (removed);
}