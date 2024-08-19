import { setChanged } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "evaluate",
    visitor: {
      "BinaryExpression|UnaryExpression|LogicalExpression|CallExpression": {
        exit(path) {
          const { node } = path;
          const { confident, value } = path.evaluate();
          const context = vm.createContext();
          if (!confident) {
            // for running jsfuck expressions
            try {
              const val = vm.runInContext(generate(node).code, context);
              if (val) {
                path.replaceWith(t.valueToNode(value));
                setChanged(true);
              }
            } catch {}
            return;
          }
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
    },
  };
}
