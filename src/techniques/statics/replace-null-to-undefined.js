import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "change-null-to-undefined",
    visitor: {
      ArrayExpression(path) {
        for (const element of path.get("elements")) {
          if (!element.node) {
            element.replaceWith(t.valueToNode(undefined));
            setChanged(true);
          }
        }
      },
    },
  };
}
