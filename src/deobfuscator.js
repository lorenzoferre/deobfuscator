import { transform } from "@babel/core";
import { changed, setChanged } from "./utils/util.js";
import removeDeadCode from "./techniques/statics/remove-dead-code.js";
import renameVariableSameScope from "./techniques/statics/rename-variable-same-scope.js";
import replaceFunctionExpressionWithFunctionDeclaration from "./techniques/statics/replace-function-expression-with-function-declaration.js";
import reconstructVariableDeclaration from "./techniques/statics/reconstruct-variable-declaration.js";
import constantPropagation from "./techniques/statics/constant-propagation.js";
import evaluate from "./techniques/statics/evaluate.js";
import replaceSingleConstantViolation from "./techniques/statics/replace-single-constant-violation.js";
import moveDeclarationBeforeLoop from "./techniques/statics/move-declaration-before-loop.js";
import replaceOutermostIife from "./techniques/statics/replace-outermost-iife.js";
import defeatingArrayMapping from "./techniques/statics/defeating-array-mapping.js";
import defeatingObjectMapping from "./techniques/statics/defeating-object-mapping.js";
import transformBracketToDot from "./techniques/statics/transform-bracket-to-dot.js";
import transformSequenceExpression from "./techniques/statics/transform-sequence-expression.js";
import replaceNullToUndefined from "./techniques/statics/replace-null-to-undefined.js";
import evaluateConditionStatement from "./techniques/statics/evaluate-condition-statement.js";
import controlFlowUnflattening from "./techniques/statics/control-flow-unflattening.js";
import removeEmptyStatement from "./techniques/statics/remove-empty-statement.js";
import evaluateFunction from "./techniques/dynamics/evaluate-function.js";

export default function deobfuscate(code, dynamic = false) {
  do {
    setChanged(false);
    var out = transform(code, {
      plugins: [
        removeDeadCode,
        renameVariableSameScope,
        replaceFunctionExpressionWithFunctionDeclaration,
        reconstructVariableDeclaration,
        constantPropagation,
        evaluate,
        replaceSingleConstantViolation,
        moveDeclarationBeforeLoop,
        replaceOutermostIife,
        defeatingArrayMapping,
        defeatingObjectMapping,
        transformBracketToDot,
        transformSequenceExpression,
        replaceNullToUndefined,
        evaluateConditionStatement,
        controlFlowUnflattening,
        removeEmptyStatement,
        dynamic ? evaluateFunction : null,
      ].filter(Boolean),
      comments: false,
      compact: false,
    });
    code = out.code;
  } while (changed);
  return out.code;
}
