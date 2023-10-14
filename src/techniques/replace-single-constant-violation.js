import { hasSingleConstantViolation } from "../utils/util.js";
import { setChanged } from "../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "replace-single-constant-violation",
    visitor: {
      ExpressionStatement(path) {
        const { node, scope } = path;
        const { expression } = node;
        if (!t.isAssignmentExpression(expression)) return;
        const { left, right } = expression;
        const binding = scope.getBinding(left.name);
        if (!binding) return;
        if (binding.scope !== scope) return;
        if (!hasSingleConstantViolation(binding, expression, t)) return;
        const declaration = t.variableDeclaration("var", [
          t.variableDeclarator(left, right),
        ]);
        binding.path.remove();
        path.replaceWith(declaration);
        setChanged(true);
      },
    },
  };
}
