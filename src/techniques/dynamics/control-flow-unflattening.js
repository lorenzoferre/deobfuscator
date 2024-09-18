import { setChanged } from "../../utils/util.js";
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

  function getNextValue(statement, name) {
    if (!t.isExpressionStatement(statement)) return;
    const { expression } = statement;
    if (!t.isAssignmentExpression(expression)) return;
    const { left, right } = expression;
    if (left.name !== name) return;
    return right.value || right.name;
  }

  return {
    name: "control-flow-unflattening",
    visitor: {
      "WhileStatement|DoWhileStatement|ForStatement": {
        exit(path) {
          const { node, scope } = path;
          const { body } = node.body;
          if (!body) return;
          const switchStatement = body[0];
          if (!t.isSwitchStatement(switchStatement)) return;
          const { discriminant } = switchStatement;
          const binding = scope.getBinding(discriminant.name);
          if (!binding) return;
          if (!t.isLiteral(binding.path.node.init)) return;
          let stuffInOrder = [];
          let doHaveToSearch = true;
          let maxIterations = 1e3;
          let iteration = 0;
          let possibleNextValue;
          let context = {};
          const { name } = binding.path.node.id;
          let { value } = binding.path.node.init;
          context[name] = value;
          const switchCases = buildSwitchCases(switchStatement);
          outerLoop: while (doHaveToSearch && iteration < maxIterations) {
            let switchCaseNodes = switchCases[value];
            // following switch case test values
            for (const switchCaseNode of switchCaseNodes) {
              if (t.isContinueStatement(switchCaseNode)) continue outerLoop;
              if (t.isBreakStatement(switchCaseNode)) break;
              if (!t.isBlockStatement(switchCaseNode)) {
                stuffInOrder.push(switchCaseNode);
                possibleNextValue = getNextValue(switchCaseNode, name);
                if (!possibleNextValue) continue;
                value = possibleNextValue;
                context[name] = value;
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
                    vm.createContext(context);
                    context[left.name] = vm.runInContext(generate(right).code, context);
                  }
                  possibleNextValue = getNextValue(statement, name);
                  if (!possibleNextValue) continue;
                  value = possibleNextValue;
                  context[name] = value;
                }
              }
            }

            for (const statement of body.slice(1)) {
              if (t.isBreakStatement(statement)) {
                doHaveToSearch = false;
                break;
              }
              if (t.isContinueStatement(statement)) continue outerLoop;
              stuffInOrder.push(statement);
            }
            // TODO evaluate the test of the loop with vm module
            vm.createContext(context);
            try {
              let testOuterLoop = vm.runInContext(generate(node.test).code, context);
              if (!testOuterLoop) doHaveToSearch = false;
            } catch {}
            iteration++;
          }
          path.replaceWithMultiple(stuffInOrder);
          setChanged(true);
        },
      },
    },
  };
}
