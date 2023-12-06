import { setChanged } from "../../utils/util.js";

export default function (babel) {
  return {
    name: "transform-sequence-expression",
    visitor: {
      SequenceExpression(path) {
        const { node } = path;
        const { expressions } = node;
        let newExpression = [];
        for (const expression of expressions) {
          newExpression.push(expression);
        }
        path.replaceWithMultiple(newExpression);
        setChanged(true);
      },
    },
  };
}
