import { transform } from "@babel/core";
import { changed, setChanged } from "./utils/util.js";
import removeDeadCode from "./techniques/remove-dead-code.js";
import renameVariableSameScope from "./techniques/rename-variable-same-scope.js";
import constantPropagation from "./techniques/constant-propagation.js";
import evaluate from "./techniques/evaluate.js";
import replaceSingleConstantViolation from "./techniques/replace-single-constant-violation.js";
import moveDeclarationBeforeLoop from "./techniques/move-declaration-before-loop.js";
import replaceOutermostIife from "./techniques/replace-outermost-iife.js";
import defeatingArrayMapping from "./techniques/defeating-array-mapping.js";
import defeatingObjectMapping from "./techniques/defeating-object-mapping.js";
import transformBracketToDot from "./techniques/transform-bracket-to-dot.js";
import replaceNullToUndefined from "./techniques/replace-null-to-undefined.js";
import evaluateConditionStatement from "./techniques/evaluate-condition-statement.js";
import controlFlowUnflattening from "./techniques/control-flow-unflattening.js";
import removeEmptyStatement from "./techniques/remove-empty-statement.js";
import evaluateFunction from "./techniques/evaluate-function.js";

export default function deobfuscate(code) {
  do {
    setChanged(false);
    var out = transform(code, {
      plugins: [
        removeDeadCode,
        renameVariableSameScope,
        constantPropagation,
        evaluate,
        replaceSingleConstantViolation,
        moveDeclarationBeforeLoop,
        replaceOutermostIife,
        defeatingArrayMapping,
        defeatingObjectMapping,
        transformBracketToDot,
        replaceNullToUndefined,
        evaluateConditionStatement,
        controlFlowUnflattening,
        removeEmptyStatement,
        evaluateFunction,
      ],
      comments: false,
      compact: false,
    });
    code = out.code;
  } while (changed);
  return out.code;
}
