import { hasSingleConstantViolation } from "../../utils/util.js";
import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "move-declaration-before-loop",
    visitor: {
      ExpressionStatement(path) {
        const { node, scope } = path;
        const { expression } = node;
        if (!t.isAssignmentExpression(expression)) return;
        const { left, right } = expression;
        const binding = scope.getBinding(left.name);
        if (!binding) return;
        if (binding.scope === scope) return;
        if (!hasSingleConstantViolation(binding, expression, t)) return;
        const declaration = t.variableDeclaration("var", [
          t.variableDeclarator(left, right),
        ]);
        const switchStatementPath = path.find(path => path.isSwitchStatement());
        if (!switchStatementPath) return;
        const loopStatementPath = switchStatementPath.find(
          path => path.isWhileStatement() || path.isDoWhileStatement()
        );
        if (!loopStatementPath) return;
        loopStatementPath.insertBefore(declaration);
        binding.path.remove();
        path.remove();
        setChanged(true);
      },
    },
  };
}
