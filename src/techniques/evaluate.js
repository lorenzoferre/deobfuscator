import { setChanged } from "../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "evaluate",
    visitor: {
      "BinaryExpression|UnaryExpression|LogicalExpression|CallExpression"(path) {
        const { confident, value } = path.evaluate();
        if (!confident) return;
        let valueNode = t.valueToNode(value);
        if (t.isUnaryExpression(path)) {
          path.replaceWith(valueNode);
          path.skip();
        }
        if (t.isLiteral(valueNode) || t.isArrayExpression(valueNode)) {
          path.replaceWith(valueNode);
          setChanged(true);
        }
      },
    },
  };
}
