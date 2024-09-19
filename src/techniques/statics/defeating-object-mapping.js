export default function (babel) {
  const { types: t } = babel;

  return {
    name: "defeating-object-mapping",
    visitor: {
      MemberExpression: {
        enter(path) {
          const { node, scope } = path;
          const binding = scope.getBinding(node.object.name);
          if (!binding) return;
          if (!binding.constant) return;
          const { init } = binding.path.node;
          if (!t.isObjectExpression(init)) return;
          const { properties } = init;
          for (const property of properties) {
            if (property.key.value !== node.property.name) continue;
            if (t.isLiteral(property.value)) {
              path.replaceWith(property.value);
            }
          }
        },
      },
    },
  };
}
