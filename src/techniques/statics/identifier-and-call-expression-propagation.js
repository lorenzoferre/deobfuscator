export default function (babel) {
  const { types: t } = babel;

  return {
    name: "identifier-and-call-expression-propagation",
    visitor: {
      VariableDeclarator(path) {
        const { node } = path;
        const { id } = node;
        const { init } = node;
        if (
          t.isIdentifier(init) ||
          (t.isCallExpression(init) && t.isIdentifier(init.callee))
        ) {
          const { scope } = path;
          const binding = scope.getBinding(id.name);
          for (const referencePath of binding.referencePaths) {
            referencePath.replaceWith(init);
          }
          path.remove();
        }
      },
    },
  };
}
