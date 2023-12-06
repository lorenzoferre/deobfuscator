import { setChanged } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

const context = vm.createContext();

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "evaluate-update-expression",
    visitor: {
      VariableDeclaration(path) {
        const { node } = path;
        const declaration = generate(node).code;
        vm.runInContext(declaration, context);
      },
      ExpressionStatement(path) {
        const { node } = path;
        const { expression } = node;
        if (t.isUpdateExpression(expression) || t.isAssignmentExpression(expression)) {
          const expressionCode = generate(node).code;
          vm.runInContext(expressionCode, context);
          console.log(context);
        }
      },
    },
  };
}
