import { setChanged } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

export default function (babel) {
  const { types: t } = babel;
  const context = vm.createContext();

  return {
    name: "evaluate-function",
    visitor: {
      FunctionDeclaration: {
        enter(path) {
          const { node } = path;
          const func = generate(node).code;
          vm.runInContext(func, context);
        },
      },
      VariableDeclarator: {
        enter(path) {
          const { node } = path;
          const { init } = node;
          if (t.isArrowFunctionExpression(init)) {
            vm.runInContext(generate(node).code, context);
          }
        },
      },
      CallExpression(path) {
        const { node } = path;
        const { callee } = node;
        if (!context.hasOwnProperty(callee.name)) return;
        const args = node.arguments;
        if (!args.every(arg => t.isLiteral(arg))) return;
        const value = vm.runInContext(generate(node).code, context);
        if (value) {
          path.replaceWith(t.valueToNode(value));
          setChanged(true);
        }
      },
    },
  };
}
