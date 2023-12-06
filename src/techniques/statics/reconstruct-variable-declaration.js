import { setChanged } from "../../utils/util.js";

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "reconstruct-variable-declaration",
    visitor: {
      VariableDeclaration(path) {
        const { node } = path;
        const { kind } = node;
        let { declarations } = node;
        if (declarations.length === 1) return;
        declarations.reverse();
        for (const declaration of declarations) {
          path.insertAfter(t.variableDeclaration(kind, [declaration]));
        }
        path.remove();
        setChanged(true);
      },
    },
  };
}
