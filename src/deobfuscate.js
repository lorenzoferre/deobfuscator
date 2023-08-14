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
import { unaryExpression } from "@babel/types";
import { logicalExpression } from "@babel/types";

export default function deobfuscate(ast) {
    traverse(ast, {
        exit(path) {
            // costant propagation
            if (t.isVariableDeclarator(path)) {
                renameVariableSameScope(path);
                defeatingMapArrayMapping(path);
                costantFolding(path);
            }
            // evaluate expression with constant values
            if (t.isBinaryExpression(path) ||
                t.isUnaryExpression(path) ||
                t.isLogicalExpression(path)) {
                evaluate(path);
            }
            // defeating literal array mappings
            if (t.isMemberExpression(path)) {
                defeatingStringArrayMapping(path);
            }
            // transform bracket notation into dot notation
            if (t.isCallExpression(path)) {
                // ADD function for reversing jsfuck notation with vm module
                transformBracketToDot(path);
                evaluate(path);
            }
            // evaluate if and ternary statementss
            if (t.isIfStatement(path) || t.isConditionalExpression(path)) {
                evaluateConditionalStatement(path);
            }
            // control flow unflattening
            
            //if (t.isWhileStatement(path) || t.isForStatement(path)) {
            //    unflatteningSwitch(path);
            //}

            // replace outermost iife with all code inside it
            if (t.isExpressionStatement(path)) {
                replaceOutermostIife(path);
            }
            // removes empty statement
            if (t.isEmptyStatement(path.node)) {
                path.remove();
            }
        }
	
    });
}