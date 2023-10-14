import { setChanged } from "../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "transform-bracket-to-dot",
    visitor: {
      CallExpression(path) {
        const { node } = path;
        let { property } = node.callee;
        if (t.isStringLiteral(property)) {
          node.callee.property = t.identifier(property.value);
          node.callee.computed = false;
          setChanged(true);
        }
      },
    },
  };
}
