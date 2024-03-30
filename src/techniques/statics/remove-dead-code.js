import { setChanged } from "../../utils/util.js";

export default function () {
  return {
    name: "remove-empty-statement",
    visitor: {
      "VariableDeclarator|FunctionDeclaration": {
        enter(path) {
          const { node, scope } = path;
          const binding = scope.getBinding(node.id.name);
          if (!binding) return;
          if (binding.constant && !binding.referenced) {
            path.remove();
            setChanged(true);
          }
        },
      },
    },
  };
}
