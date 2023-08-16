import { traverse } from "@babel/core";
import * as t from "@babel/types";

import renameVariableSameScope from "./rename-variables-same-scope.js";
import defeatingMapArrayMapping from "./defeating-map-array-mappings.js";
import costantFolding from "./costant-folding.js";
import evaluate from "./evaluate.js";
import defeatingStringArrayMapping from "./defeating-string-array-mappings.js";
import transformBracketToDot from "./transform-from-brackets-to-dots.js";
import evaluateConditionalStatement from "./evaluate-conditional-statements.js";
import replaceOutermostIife from "./replace-outermost-iifes.js";
import deleteUnreachableFunctions from "./delete-unreachable-functions.js";

export default function deobfuscate(ast) {
    deleteUnreachableFunctions(ast);
    traverse(ast, {
        exit(path) {
            // costant folding
            if (t.isVariableDeclarator(path)) {
                renameVariableSameScope(path);
                defeatingMapArrayMapping(path);
                costantFolding(path);
            }
            // evaluate expressions with constant values
            if (t.isBinaryExpression(path) ||
                t.isUnaryExpression(path) ||
                t.isLogicalExpression(path)) {
                evaluate(path);
            }
            // defeating literals array mappings
            if (t.isMemberExpression(path)) {
                defeatingStringArrayMapping(path);
            }
            // transform brackets notation into dots notation
            if (t.isCallExpression(path)) {
                // ADD function for reversing jsfuck notation with vm module
                transformBracketToDot(path);
                evaluate(path);
            }
            // evaluate if statements and ternary statements
            if (t.isIfStatement(path) || t.isConditionalExpression(path)) {
                evaluateConditionalStatement(path);
            }
            // control flow unflattening
            
            //if (t.isWhileStatement(path) || t.isForStatement(path)) {
            //    unflatteningSwitch(path);
            //}

            // replace outermost iife with all the code inside it
            if (t.isExpressionStatement(path)) {
                replaceOutermostIife(path);
            }
            // removes empty statements
            if (t.isEmptyStatement(path.node)) {
                path.remove();
            }
        }
	
    });
}