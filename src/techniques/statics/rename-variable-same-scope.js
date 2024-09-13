export default function () {
  return {
    name: "rename-variable-same-scope",
    visitor: {
      VariableDeclarator: {
        enter(path) {
          const { node, scope } = path;
          const { id } = node;
          const { name } = id;
          const { parent } = scope;
          if (!parent) return;
          for (const binding in parent.bindings) {
            if (binding === name) {
              const newName = scope.generateUidIdentifier(name);
              scope.rename(name, newName.name);
            }
          }
        },
      },
    },
  };
}
