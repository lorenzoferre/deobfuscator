import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "replace-function-expression-with-function-declaration",
    visitor: {
      VariableDeclaration: {
        enter(path) {
          const { node } = path;
          const { declarations } = node;
          if (declarations.length !== 1) return;
          const declaration = declarations[0];
          if (!t.isFunctionExpression(declaration.init)) return;
          path.replaceWith(
            t.functionDeclaration(
              declaration.id,
              declaration.init.params,
              declaration.init.body,
              declaration.init.generator,
              declaration.init.async
            )
          );
          setChanged(true);
        },
      },
    },
  };
}
