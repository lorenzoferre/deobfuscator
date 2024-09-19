import { transform } from "@babel/core";
import { changed, setChanged } from "./utils/util.js";
import removeDeadCode from "./techniques/statics/remove-dead-code.js";
import renameVariableSameScope from "./techniques/statics/rename-variable-same-scope.js";
import reconstructVariableDeclaration from "./techniques/statics/reconstruct-variable-declaration.js";
import constantPropagation from "./techniques/statics/constant-propagation.js";
import evaluate from "./techniques/statics/evaluate.js";
import replaceOutermostIife from "./techniques/statics/replace-outermost-iife.js";
import defeatingArrayMapping from "./techniques/statics/defeating-array-mapping.js";
import defeatingObjectMapping from "./techniques/statics/defeating-object-mapping.js";
import transformBracketToDot from "./techniques/statics/transform-bracket-to-dot.js";
import transformSequenceExpression from "./techniques/statics/transform-sequence-expression.js";
import replaceNullToUndefined from "./techniques/statics/replace-null-to-undefined.js";
import evaluateConditionStatement from "./techniques/statics/evaluate-condition-statement.js";
import removeEmptyStatement from "./techniques/statics/remove-empty-statement.js";
import evaluateFunction from "./techniques/dynamics/evaluate-function.js";
import evaluateUpdateExpression from "./techniques/dynamics/evaluate-update-expression.js";
import controlFlowUnflattening from "./techniques/dynamics/control-flow-unflattening.js";

export default function deobfuscate(code) {
  var out = transform(code, {
    plugins: [
      renameVariableSameScope,
      reconstructVariableDeclaration,
      controlFlowUnflattening,
      constantPropagation,
      evaluate,
      replaceOutermostIife,
      defeatingArrayMapping,
      defeatingObjectMapping,
      transformBracketToDot,
      transformSequenceExpression,
      replaceNullToUndefined,
      evaluateConditionStatement,
      evaluateFunction,
      evaluateUpdateExpression,
    ],
    comments: false,
    compact: false,
  });
  code = out.code;

  do {
    setChanged(false);
    out = transform(code, {
      plugins: [removeDeadCode, removeEmptyStatement],
      comments: false,
      compact: false,
    });
    code = out.code;
  } while (changed);

  return out.code;
}
