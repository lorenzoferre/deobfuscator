export default function (babel) {
  const { types: t } = babel;

  return {
    name: "replace-outermost-iife",
    visitor: {
      ExpressionStatement: {
        exit(path) {
          const { node, parent } = path;
          if (!t.isProgram(parent)) return;
          const { expression } = node;
          if (!t.isCallExpression(expression)) return;
          const { callee } = expression;
          if (!t.isFunctionExpression(callee) && !t.isArrowFunctionExpression(callee))
            return;
          const { body } = callee.body;
          if (body.some(node => t.isReturnStatement(node))) return;
          path.replaceWithMultiple(body);
        },
      },
    },
  };
}
