import { context } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  function processVariableDeclarators(path) {
    const { node } = path;
    const { id, init } = node;
    const { name } = id;

    // mapping names to values
    if (!init) {
      context[name] = null;
    } else {
      if (!t.isLiteral(init)) return;
      const { value } = init;
      context[name] = value;
    }
  }

  return {
    name: "insert-variable-within-context",
    visitor: {
      Program: {
        enter(path) {
          path.traverse({
            VariableDeclarator(path) {
              processVariableDeclarators(path);
            },
          });
        },
      },
    },
  };
}
