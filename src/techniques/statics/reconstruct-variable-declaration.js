export default function (babel) {
  const { types: t } = babel;
  return {
    name: "reconstruct-variable-declaration",
    visitor: {
      VariableDeclaration: {
        enter(path) {
          const { node } = path;
          const { parent } = path;
          const { kind } = node;
          let { declarations } = node;
          let newDeclarations = [];
          if (declarations.length === 1) return;
          for (const declaration of declarations) {
            if (
              t.isForStatement(parent) ||
              t.isForInStatement(parent) ||
              t.isForOfStatement(parent)
            )
              continue;
            newDeclarations.push(t.variableDeclaration(kind, [declaration]));
          }
          if (newDeclarations.length !== 0) path.replaceWithMultiple(newDeclarations);
        },
      },
    },
  };
}
