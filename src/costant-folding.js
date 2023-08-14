import * as t from "@babel/types";

export default function costantFolding(path) {
    if (!path.node.init) return;
    if (!t.isLiteral(path.node.init) && t.isIdentifier(path.node.init) && !globalFunctions.has(path.node.init.name)) return;
    const binding = path.scope.getBinding(path.node.id.name);
    if (!binding.constant) return;
    for (let refPath of binding.referencePaths) {
        refPath.replaceWith(path.node.init);
    }
    path.remove();
    //path.stop();
}