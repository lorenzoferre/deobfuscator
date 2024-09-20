import { context } from "../../utils/util.js";
import _generate from "@babel/generator";
const generate = _generate.default;
import vm from "vm";

export default function (babel) {
  const { types: t } = babel;

  function buildSwitchCases(switchStatement) {
    let switchCases = {};
    for (const switchCase of switchStatement.cases) {
      const key = switchCase.test.value || switchCase.test.name;
      switchCases[key] = switchCase.consequent;
    }
    return switchCases;
  }

  function areIdentifiersInContext(node, context) {
    if (t.isIdentifier(node)) return context.hasOwnProperty(node.name);
    if (t.isBinaryExpression(node)) {
      return (
        areIdentifiersInContext(node.left, context) &&
        areIdentifiersInContext(node.right, context)
      );
    }
    if (t.isLiteral(node)) return true;
    return false;
  }

  return {
    name: "control-flow-unflattening",
    visitor: {
      "WhileStatement|DoWhileStatement|ForStatement": {
        enter(path) {
          const { node } = path;
          const { body } = node.body;
          if (!body) return;
          const switchStatement = body[0];
          if (!t.isSwitchStatement(switchStatement)) return;
          const { name } = switchStatement.discriminant;
          if (
            (context[name] === undefined || context[name] === null) &&
            !t.isLiteral(context[name])
          )
            return;
          let stuffInOrder = [];
          let doHaveToSearch = true;
          let maxIterations = 1e3;
          let iteration = 0;
          const switchCases = buildSwitchCases(switchStatement);
          outerLoop: while (doHaveToSearch && iteration < maxIterations) {
            let value = context[name];
            let switchCaseNodes = switchCases[value];
            // following switch case test values
            for (const switchCaseNode of switchCaseNodes) {
              if (t.isContinueStatement(switchCaseNode)) continue outerLoop;
              if (t.isBreakStatement(switchCaseNode)) break;
              if (!t.isBlockStatement(switchCaseNode)) {
                stuffInOrder.push(switchCaseNode);
              } else {
                for (let statement of switchCaseNode.body) {
                  stuffInOrder.push(statement);
                  if (!t.isExpressionStatement(statement)) continue;
                  const { expression } = statement;
                  if (!t.isAssignmentExpression(expression)) continue;
                  const { left } = expression;
                  const { right } = expression;
                  if (t.isLiteral(right)) context[left.name] = right.value;
                  if (t.isBinaryExpression(right)) {
                    if (areIdentifiersInContext(right, context)) {
                      const evaluatedExpression = vm.runInContext(
                        generate(right).code,
                        context
                      );
                      if (evaluatedExpression) context[left.name] = evaluatedExpression;
                    }
                  }
                }
              }
            }
            let testOuterLoop = vm.runInContext(generate(node.test).code, context);
            if (!testOuterLoop) doHaveToSearch = false;
            iteration++;
          }
          path.replaceWithMultiple(stuffInOrder);
        },
      },
    },
  };
}
