export default function (babel) {
  const { types: t } = babel;

  return {
    name: "transform-bracket-to-dot",
    visitor: {
      MemberExpression: {
        exit(path) {
          const { node } = path;
          let { property } = node;
          if (
            t.isStringLiteral(property) &&
            property.value !== "@@iterator" &&
            !property.value.includes("=")
          ) {
            node.property = t.identifier(property.value);
            node.computed = false;
          }
        },
      },
    },
  };
}
