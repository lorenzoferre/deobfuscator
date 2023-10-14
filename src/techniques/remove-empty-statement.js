export default function () {
  return {
    name: "remove-empty-statement",
    visitor: {
      EmptyStatement(path) {
        path.remove();
      },
    },
  };
}
