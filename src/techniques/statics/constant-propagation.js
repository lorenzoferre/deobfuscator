import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "constant-propagation",
    visitor: {
      VariableDeclarator(path) {
        const { node, scope } = path;
        const { id, init } = node;
        if (!t.isLiteral(init) && !t.isUnaryExpression(init)) return;
        const binding = scope.getBinding(id.name);
        if (!binding) return;
        if (!binding.constant) return;
        for (const referencePath of binding.referencePaths) {
          referencePath.replaceWith(init);
        }
        path.remove();
        setChanged(true);
      },
    },
  };
}
