export default function (babel) {
  const { types: t } = babel;

  return {
    name: "remove-empty-statement",
    visitor: {
      EmptyStatement: {
        enter(path) {
          path.remove();
        },
      },
      BlockStatement: {
        enter(path) {
          const { node, parent } = path;
          const { body } = node;
          if (
            body.length !== 0 ||
            t.isFunctionDeclaration(parent) ||
            t.isArrowFunctionExpression(parent)
          ) {
            return;
          }
          path.remove();
        },
      },
    },
  };
}
