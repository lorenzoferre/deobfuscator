import { setChanged } from "../../utils/util.js";

function buildSwitchBlocks(switchStatement) {
  let switchBlocks = {};
  for (const switchCase of switchStatement.cases) {
    const key = switchCase.test.value || switchCase.test.name;
    switchBlocks[key] = switchCase.consequent;
  }
  return switchBlocks;
}

function getNextValue(statement, name, t) {
  if (!t.isExpressionStatement(statement)) return;
  const { expression } = statement;
  if (!t.isAssignmentExpression(expression)) return;
  const { left, right } = expression;
  if (left.name !== name) return;
  return right.value || right.name;
}

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "control-flow-unflattening",
    visitor: {
      "WhileStatement|DoWhileStatement"(path) {
        const { node, scope } = path;
        const { body } = node.body;
        if (!body) return;
        const switchStatement = body[0];
        if (!t.isSwitchStatement(switchStatement)) return;
        const { discriminant } = switchStatement;
        const binding = scope.getBinding(discriminant.name);
        if (!binding) return;
        if (!t.isLiteral(binding.path.node.init)) return;
        const { name } = binding.path.node.id;
        let { value } = binding.path.node.init;
        const switchBlocks = buildSwitchBlocks(switchStatement);
        let stuffInOrder = [];
        for (let i = 0; i < Object.keys(switchBlocks).length; i++) {
          let blocksByCase = switchBlocks[value];
          if (!blocksByCase) return;
          for (const block of blocksByCase) {
            if (!t.isBlockStatement(block)) continue;
            for (let statement of block.body) {
              stuffInOrder.push(statement);
              const nextValue = getNextValue(statement, name, t);
              if (!nextValue) continue;
              value = nextValue;
              blocksByCase = switchBlocks[value];
            }
          }
        }
        path.replaceWithMultiple(stuffInOrder);
        setChanged(true);
      },
    },
  };
}
