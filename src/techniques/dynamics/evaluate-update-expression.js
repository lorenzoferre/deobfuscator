import { context, setChanged } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

export default function (babel) {
  const { types: t } = babel;
  const functionMap = {};
  const callStack = [];

  function processVariableDeclarators(path) {
    const { node } = path;
    const { id, init } = node;
    const { name } = id;

    // mapping names to values
    if (!init) {
      context[name] = undefined;
    } else {
      if (!t.isLiteral(init)) return;
      const { value } = init;
      context[name] = value;
    }
  }

  function processExpressionStatement(path) {
    const { node, scope } = path;
    const { expression } = node;

    if (t.isUpdateExpression(expression) || t.isAssignmentExpression(expression)) {
      const expressionCode = generate(node).code;
      let variableName;
      if (t.isUpdateExpression(expression)) {
        variableName = expression.argument.name;
      } else if (t.isAssignmentExpression(expression)) {
        if (!t.isIdentifier(expression.left)) return;
        variableName = expression.left.name;
      }
      if (!context.hasOwnProperty(variableName)) return;
      const value = vm.runInContext(expressionCode, context);
      if (value && typeof value !== "function") {
        context[variableName] = value;
        const binding = scope.getBinding(variableName);
        if (!binding) return;
        for (const referencePath of binding.referencePaths) {
          referencePath.replaceWith(t.valueToNode(value));
        }
        path.remove();
      }
    }
  }

  function traverseFunction(name) {
    const functionPath = functionMap[name];
    if (functionPath) {
      functionPath.traverse({
        ExpressionStatement(path) {
          processExpressionStatement(path);
        },
      });
    }
  }

  return {
    name: "evaluate-update-expression",
    visitor: {
      Program: {
        enter(path) {
          path.traverse({
            FunctionDeclaration(path) {
              const { node } = path;
              const { id } = node;
              functionMap[id.name] = path;
            },
            CallExpression(path) {
              const { node } = path;
              const { callee } = node;
              const { name } = callee;
              callStack.push(name);
            },
            VariableDeclarator(path) {
              processVariableDeclarators(path);
            },
          });

          while (callStack.length > 0) {
            const currentCall = callStack.shift();
            traverseFunction(currentCall);
          }
        },
      },
    },
  };
}
