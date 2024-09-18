import { context, setChanged } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

export default function (babel) {
  const { types: t } = babel;

  function getNameFromNode(node) {
    if (t.isIdentifier(node)) {
      return node.name;
    } else if (t.isMemberExpression(node) && t.isIdentifier(node.object)) {
      return node.left.name;
    } else if (t.isAssignmentExpression(node) && t.isIdentifier(node.left)) {
      return node.left.name;
    } else if (t.isVariableDeclarator(node) && t.isIdentifier(node.id)) {
      return node.id.name;
    } else if (t.isUpdateExpression(node) && t.isIdentifier(node.argument)) {
      return node.argument.name;
    }
    return null;
  }

  return {
    name: "evaluate",
    visitor: {
      "BinaryExpression|UnaryExpression|LogicalExpression|CallExpression|UpdateExpression|AssignmentExpression|SequenceExpression":
        {
          exit(path) {
            const { node } = path;
            if (t.isCallExpression(node)) {
              const { callee } = node;
              if (
                t.isMemberExpression(callee) &&
                ((callee.object.name === "Math" && callee.property.name === "random") ||
                  (callee.object.name === "console" && callee.property.name === "log"))
              )
                return;
            }
            const { confident, value } = path.evaluate();
            if (confident) {
              const valueNode = t.valueToNode(value);
              if (t.isUnaryExpression(valueNode)) {
                path.replaceWith(valueNode);
                path.skip();
              }
              if (t.isLiteral(valueNode) || t.isArrayExpression(valueNode)) {
                path.replaceWith(valueNode);
                setChanged(true);
              }
            } else {
              let name = getNameFromNode(node);
              if (!name || !context[name]) return;
              const expressionCode = generate(node).code;
              const evaluatedValue = vm.runInContext(expressionCode, context);
              if (evaluatedValue) {
                const { scope } = path;
                const binding = scope.getBinding(name);
                if (!binding) return;
                for (const referencePath of binding.referencePaths) {
                  const { parent } = referencePath;
                  if (
                    t.isUpdateExpression(parent) ||
                    t.isAssignmentExpression(parent) ||
                    t.isVariableDeclarator(parent)
                  )
                    continue;
                  referencePath.replaceWith(t.valueToNode(context[name]));
                }
                path.remove();
                setChanged(true);
              }
            }
          },
        },
    },
  };
}
