import { setChanged } from "../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "defeating-array-mapping",
    visitor: {
      MemberExpression(path) {
        const { node, scope } = path;
        const { property } = node;
        if (!property) return;
        if (!t.isNumericLiteral(property)) return;
        const index = property.value;
        const binding = scope.getBinding(node.object.name);
        if (!binding) return;
        if (!t.isVariableDeclarator(binding.path.node)) return;
        if (!t.isArrayExpression(binding.path.node.init)) return;
        let array = binding.path.node.init;
        if (index >= array.length) return;
        let member = array.elements[index];
        if (t.isLiteral(member)) {
          path.replaceWith(member);
          setChanged(true);
        }
      },
    },
  };
}
