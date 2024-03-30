import { setChanged } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

export default function (babel) {
  const { types: t } = babel;
  const context = vm.createContext();
  let scopeUid;

  return {
    name: "evaluate-update-expression",
    visitor: {
      VariableDeclarator: {
        enter(path) {
          const { node } = path;
          const { scope } = path;
          scopeUid = scope.uid;
          const declaration = generate(node).code;
          vm.runInContext(declaration, context);
        },
      },
      ExpressionStatement: {
        enter(path) {
          const { node } = path;
          const { scope } = path;
          if (scopeUid !== scope.uid) return;
          const { expression } = node;
          if (t.isUpdateExpression(expression) || t.isAssignmentExpression(expression)) {
            const expressionCode = generate(node).code;
            const value = vm.runInContext(expressionCode, context);
            if (value) {
              path.remove();
              setChanged(true);
            }
          }
        },
      },
      Identifier: {
        enter(path) {
          const { node } = path;
          const { scope } = path;
          if (scopeUid !== scope.uid) return;
          const { parent } = path;
          if (t.isUpdateExpression(parent) || t.isAssignmentExpression(parent)) return;
          const parentFather = path.parentPath.parent;
          if (!t.isExpressionStatement(parentFather)) return;
          if (context.hasOwnProperty(node.name)) {
            path.replaceWith(t.valueToNode(context[node.name]));
            setChanged(true);
          }
        },
      },
    },
  };
}
