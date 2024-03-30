export let changed;

export function setChanged(value) {
  changed = value;
}

export function hasSingleConstantViolation(binding, expression, t) {
  if (!t.isVariableDeclarator(binding.path.node)) return;
  if (binding.path.node.init !== null) return;
  if (binding.kind !== "var") return;
  if (binding.constantViolations.length !== 1) return;
  if (expression !== binding.constantViolations[0].node) return;
  return true;
}

export function removeNewLinesAndTabs(pieceOfCode) {
  return pieceOfCode.split("\n").join(" ").split("  ").join("");
}
