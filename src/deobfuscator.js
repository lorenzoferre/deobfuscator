import babel from "@babel/core";
import * as t from "@babel/types";
import _generate from "@babel/generator";
const generate = _generate.default;

export default class Deobfuscator {
    #ast;
    #changed;

    constructor(obfuscatedCode) {
        this.#ast = babel.parse(obfuscatedCode);
    }

    deobfuscate() {
        const self = this;
        do {
            this.#changed = false;
            self.#removeDeadCode();
            babel.traverse(this.#ast, {
                exit(path) {
                    // costant folding
                    if (t.isVariableDeclarator(path)) {
                        self.#renameVariableSameScope(path);
                        self.#costantPropagation(path);
                    }
                    // evaluate expressions with constant values
                    if (t.isBinaryExpression(path) ||
                        t.isUnaryExpression(path) ||
                        t.isLogicalExpression(path)) {
                            self.#evaluate(path);
                    }
                    // defeating literals array mappings
                    if (t.isMemberExpression(path)) {
                        self.#defeatingStringArrayMapping(path);
                    }
                    // transform brackets notation into dots notation
                    if (t.isCallExpression(path)) {
                        // TODO reverse jsfuck notation with vm module
                        self.#transformBracketToDot(path);
                        self.#evaluate(path);
                    }
                    // evaluate if statements and ternary statements
                    if (t.isIfStatement(path) || t.isConditionalExpression(path)) {
                        self.#evaluateConditionalStatement(path);
                    }
                    // control flow unflattening
                    
                    //if (t.isWhileStatement(path) || t.isForStatement(path)) {
                    //    unflatteningSwitch(path);
                    //}

                    // replace outermost iife with all the code inside it
                    if (t.isExpressionStatement(path)) {
                        self.#replaceOutermostIife(path);
                    }
                }
            });
            this.#ast = babel.parse(generate(this.#ast, {comments: false}).code);
        } while(this.#changed);

        return this.#generateOutputCode();

    }

    #removeDeadCode() {
        let removed;
        do {
            removed = false;
			babel.traverse(this.#ast, {
                "VariableDeclarator|FunctionDeclaration"(path) {
                    const { node, scope } = path;
                    const { constant, referenced } = scope.getBinding(node.id.name);
                    if (constant && !referenced) {
                        path.remove();
                        removed = true;
                    }
                },
                EmptyStatement(path) {
                    path.remove();
                }
            });
            this.#ast = babel.parse(generate(this.#ast, {comments: false}).code);
        } while (removed);

    }

    #renameVariableSameScope(path) {
        const { node, scope } = path;
        if (!node) return;
        const { name } = node.id;
        const { parent } = scope;
        if (!parent) return;
        for (const binding in parent.bindings) {
            if (binding == name) {
                const newName = scope.generateUidIdentifier(name);
                scope.rename(name, newName.name);
            }
        }
    }

    #costantPropagation(path) {
        const { id, init } = path.node;
        if (!t.isLiteral(init) && !t.isUnaryExpression(init)) return;
        const { constant, referencePaths } = path.scope.getBinding(id.name);
        if (!constant) return;
        for (const referencePath of referencePaths) {
            referencePath.replaceWith(init);
        }
        path.remove();
        this.#changed = true;
    }

	#evaluate(path) {
        const { confident, value } = path.evaluate();
        if (!confident) return;
		let valueNode = t.valueToNode(value);
		if (t.isUnaryExpression(path)) {
			if (path.node.operator === "-" || path.node.operator === "~") {
				path.replaceWith(valueNode);
				path.skip();
			}
		}
        if (t.isLiteral(valueNode) || t.isArrayExpression(valueNode)) {
            path.replaceWith(valueNode);
            this.#changed = true;
        }
    }

    #defeatingStringArrayMapping(path) {
        const { node, scope } = path;
        const { property } = node;
        if (!property) return;
        if (!t.isNumericLiteral(property)) return;
        const index = property.value;
        const binding = scope.getBinding(node.object.name);
        if (!binding) return;
        if (t.isVariableDeclarator(binding.path.node)) {
            let array = binding.path.node.init;
            if (index >= array.length) return;
            let member = array.elements[index];
            if (t.isLiteral(member)) {
                path.replaceWith(member);
                this.#changed = true;
            }
        }
    }

    #transformBracketToDot(path) {
        const { node } = path
        let { property } = node.callee;
        if (t.isStringLiteral(property)) {
            node.callee.property = t.identifier(property.value);
            node.callee.computed = false;
            this.#changed = true;
        }
    }

    #evaluateConditionalStatement(path) {
        const isTruthy = path.get("test").evaluateTruthy();
        const { consequent, alternate } = path.node;
        if (isTruthy == undefined) return;
        if (isTruthy) {
            if (t.isBlockStatement(consequent)) {
                path.replaceWithMultiple(consequent.body);
            } else {
                path.replaceWith(consequent);
            }
        } else if (alternate != null) {
            if (t.isBlockStatement(alternate)) {
                path.replaceWithMultiple(alternate.body);
            } else {
                path.replaceWith(alternate);
            }
        } else {
            path.remove();
        }
        this.#changed = true;
    }

    #replaceOutermostIife(path) {
        const { node, parent } = path;
        if (!t.isProgram(parent)) return;
        const { expression } = node;
        if (!t.isCallExpression(expression)) return;
        const { callee } = expression;
        if (!t.isFunctionExpression(callee) && !t.isArrowFunctionExpression(callee)) return;
        const { body } = callee.body;
        path.replaceWithMultiple(body);
        this.#changed = true;
    }

    #generateOutputCode() {
        const output = generate(this.#ast, { comments: false });
	    return output.code
    }

}