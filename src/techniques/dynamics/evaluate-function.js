import { setChanged } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

const context = vm.createContext();
var functionName;

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "evaluate-function",
    visitor: {
      FunctionDeclaration(path) {
        const { node } = path;
        functionName = node.id.name;
        const func = generate(node).code;
        vm.runInContext(func, context);
      },
      CallExpression(path) {
        const { node } = path;
        const { callee } = node;
        if (callee.name !== functionName) return;
        const args = node.arguments;
        if (!args.every(arg => t.isLiteral(arg))) return;
        const expressionCode = generate(node).code;
        const value = vm.runInContext(expressionCode, context);
        if (value) {
          path.replaceWith(t.valueToNode(value));
          setChanged(true);
        }
      },
    },
  };
}
