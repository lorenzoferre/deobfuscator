import * as t from "@babel/types";

export default function costantFolding(path) {
    const { id, init } = path.node;
    if (!t.isLiteral(init)) return;
    let { constant, referencePaths } = path.scope.getBinding(id.name);
    if (!constant) return;
    for (let referencePath of referencePaths) {
        referencePath.replaceWith(init);
    }
    path.remove();
}