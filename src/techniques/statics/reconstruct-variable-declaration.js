import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;
  return {
    name: "reconstruct-variable-declaration",
    visitor: {
      VariableDeclaration: {
        enter(path) {
          const { node } = path;
          const { parentPath } = path;
          const { kind } = node;
          let { declarations } = node;
          if (declarations.length === 1) return;
          for (const declaration of declarations) {
            if (
              t.isForStatement(parentPath.node) ||
              t.isForInStatement(parentPath.node) ||
              t.isForOfStatement(parentPath.node)
            ) {
              parentPath.insertBefore(t.variableDeclaration(kind, [declaration]));
            } else {
              path.insertBefore(t.variableDeclaration(kind, [declaration]));
            }
          }
          path.remove();
          setChanged(true);
        },
      },
    },
  };
}
