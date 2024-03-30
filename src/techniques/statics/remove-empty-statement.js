export default function () {
  return {
    name: "remove-empty-statement",
    visitor: {
      EmptyStatement: {
        enter(path) {
          path.remove();
        },
      },
    },
  };
}
