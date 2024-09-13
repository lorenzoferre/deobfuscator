export default function (babel) {
  const { types: t } = babel;

  function replaceArrayMember(path, array, index) {
    if (index >= array.length) return;
    const member = array[index];
    if (t.isLiteral(member)) {
      path.replaceWith(member);
    }
  }

  return {
    name: "defeating-array-mapping",
    visitor: {
      MemberExpression: {
        enter(path) {
          const { node, scope } = path;
          const { property, object } = node;
          if (!t.isNumericLiteral(property)) return;
          const index = property.value;
          const binding = scope.getBinding(node.object.name);
          if (binding) {
            if (
              t.isVariableDeclarator(binding.path.node) &&
              t.isArrayExpression(binding.path.node.init)
            ) {
              const array = binding.path.node.init.elements;
              replaceArrayMember(path, array, index);
            }
          } else if (t.isArrayExpression(object)) {
            const array = object.elements;
            replaceArrayMember(path, array, index);
          }
        },
      },
    },
  };
}
