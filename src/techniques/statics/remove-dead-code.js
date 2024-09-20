import { setChanged } from "../../utils/util.js";

export default function () {
  return {
    name: "remove-dead-code",
    visitor: {
      "VariableDeclarator|FunctionDeclaration": {
        enter(path) {
          const { node, scope } = path;
          const { id } = node;
          const { name } = id;
          const binding = scope.getBinding(name);
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
