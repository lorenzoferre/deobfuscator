import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "transform-bracket-to-dot",
    visitor: {
      MemberExpression: {
        enter(path) {
          const { node } = path;
          let { property } = node;
          if (!property) return;
          if (t.isStringLiteral(property)) {
            node.property = t.identifier(property.value);
            node.computed = false;
            setChanged(true);
          }
        },
      },
    },
  };
}
