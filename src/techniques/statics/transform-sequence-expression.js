export default function (babel) {
  return {
    name: "transform-sequence-expression",
    visitor: {
      SequenceExpression: {
        enter(path) {
          const { node } = path;
          const { expressions } = node;
          let newExpression = [];
          for (const expression of expressions) {
            newExpression.push(expression);
          }
          path.replaceWithMultiple(newExpression);
          path.skip();
        },
      },
    },
  };
}
