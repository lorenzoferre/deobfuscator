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
          if (!node.init) return;
          const { scope } = path;
          scopeUid = scope.uid;
          const declaration = generate(node).code;
          try {
            vm.runInContext(declaration, context);
          } catch {}
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
            try {
              const value = vm.runInContext(expressionCode, context);
              if (value) {
                path.remove();
                setChanged(true);
              }
            } catch {}
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
            if (
              typeof context[node.name] === "function" ||
              typeof context[node.name] === "object"
            )
              return;
            path.replaceWith(t.valueToNode(context[node.name]));
            setChanged(true);
          }
        },
      },
    },
  };
}
