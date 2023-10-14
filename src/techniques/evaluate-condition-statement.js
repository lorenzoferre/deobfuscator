import { setChanged } from "../utils/util.js";

function replaceWithBody(path, branch, t) {
  if (t.isBlockStatement(branch)) {
    path.replaceWithMultiple(branch.body);
  } else {
    path.replaceWith(branch);
  }
}

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "evaluate-condition-statement",
    visitor: {
      "IfStatement|ConditionalExpression"(path) {
        const isTruthy = path.get("test").evaluateTruthy();
        const { consequent, alternate } = path.node;
        if (isTruthy === undefined) return;
        if (isTruthy) {
          replaceWithBody(path, consequent, t);
        } else if (alternate != null) {
          replaceWithBody(path, alternate, t);
        } else {
          path.remove();
        }
        setChanged(true);
      },
    },
  };
}
