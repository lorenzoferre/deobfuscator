import { setChanged, context } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "evaluate-function",
    visitor: {
      Program: {
        enter(path) {
          path.traverse({
            FunctionDeclaration(innerPath) {
              const { node } = innerPath;
              const func = generate(node).code;
              vm.runInContext(func, context);
            },
            VariableDeclarator(innerPath) {
              const { node } = innerPath;
              const { init } = node;
              if (t.isArrowFunctionExpression(init)) {
                const arrowFunc = generate(node).code;
                vm.runInContext(arrowFunc, context);
              }
            },
          });
        },
        exit(path) {
          path.traverse({
            CallExpression(innerPath) {
              const { node } = innerPath;
              const { callee } = node;
              if (!context.hasOwnProperty(callee.name)) return;
              const args = node.arguments;
              if (!args.every(arg => t.isLiteral(arg))) return;
              const value = vm.runInContext(generate(node).code, context);
              if (value && typeof value !== "function") {
                innerPath.replaceWith(t.valueToNode(value));
              }
            },
          });
        },
      },
    },
  };
}
