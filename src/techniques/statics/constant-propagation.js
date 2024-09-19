export default function (babel) {
  const { types: t } = babel;

  return {
    name: "constant-propagation",
    visitor: {
      VariableDeclarator: {
        enter(path) {
          const { node, scope } = path;
          const { id, init } = node;
          if (
            !t.isLiteral(init) &&
            !t.isUnaryExpression(init) &&
            (!t.isArrayExpression(init) ||
              init.elements.some(element => !t.isLiteral(element)))
          )
            return;
          const binding = scope.getBinding(id.name);
          if (!binding) return;
          if (!binding.constant) return;
          for (const referencePath of binding.referencePaths) {
            referencePath.replaceWith(init);
          }
          path.remove();
        },
      },
    },
  };
}
