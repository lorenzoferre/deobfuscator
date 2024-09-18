import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  function replaceWithBody(path, branch) {
    if (t.isBlockStatement(branch)) {
      path.replaceWithMultiple(branch.body);
    } else {
      path.replaceWith(branch);
    }
  }

  return {
    name: "evaluate-condition-statement",
    visitor: {
      "IfStatement|ConditionalExpression": {
        exit(path) {
          const isTruthy = path.get("test").evaluateTruthy();
          const { consequent, alternate } = path.node;
          if (isTruthy === undefined) return;
          if (isTruthy) {
            replaceWithBody(path, consequent);
          } else if (alternate != null) {
            replaceWithBody(path, alternate);
          } else {
            path.remove();
          }
          setChanged(true);
        },
      },
    },
  };
}
