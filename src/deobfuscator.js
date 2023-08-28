import babel from "@babel/core";
import * as t from "@babel/types";
import _generate from "@babel/generator";
const generate = _generate.default;

export default class Deobfuscator {
  #ast;
  #changed;
  #removed;
  #deobfuscateVisitor;
  #removeDeadCodeVisitor;

  constructor(obfuscatedCode) {
    this.#ast = babel.parse(obfuscatedCode);
    const self = this;

    this.#deobfuscateVisitor = {
      // costant folding
      VariableDeclarator(path) {
        self.#renameVariableSameScope(path);
        self.#constantPropagation(path);
      },
      // evaluate expressions with constant values
      "BinaryExpression|UnaryExpression|LogicalExpression"(path) {
        self.#evaluate(path);
      },
      // defeating literals array mappings
      MemberExpression(path) {
        self.#defeatingArrayMapping(path);
      },
      // transform brackets notation into dots notation
      CallExpression(path) {
        self.#transformBracketToDot(path);
        self.#evaluate(path);
      },
      // used for evaluating specific jsfuck notation
      ArrayExpression(path) {
        self.#changeEmptyElementToUndefined(path);
      },
      // evaluate if statements and ternary statements
      "IfStatement|ConditionalExpression"(path) {
        self.#evaluateConditionalStatement(path);
      },
      // replace outermost iife with all the code inside it
      ExpressionStatement(path) {
        self.#replaceOutermostIife(path);
      },
      EmptyStatement(path) {
        path.remove();
      },
    };

    this.#removeDeadCodeVisitor = {
      "VariableDeclarator|FunctionDeclaration"(path) {
        const { node, scope } = path;
        const { constant, referenced } = scope.getBinding(node.id.name);
        if (constant && !referenced) {
          path.remove();
          self.#removed = true;
        }
      },
    };
  }

  deobfuscate() {
    do {
      this.#changed = false;
      this.#removeDeadCode();
      babel.traverse(this.#ast, this.#deobfuscateVisitor);
      this.#ast = babel.parse(generate(this.#ast, { comments: false }).code);
    } while (this.#changed);

    return this.#generateOutputCode();
  }

  #removeDeadCode() {
    do {
      this.#removed = false;
      babel.traverse(this.#ast, this.#removeDeadCodeVisitor);
      this.#ast = babel.parse(generate(this.#ast, { comments: false }).code);
    } while (this.#removed);
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

  #constantPropagation(path) {
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
      path.replaceWith(valueNode);
      path.skip();
    }
    if (t.isLiteral(valueNode) || t.isArrayExpression(valueNode)) {
      path.replaceWith(valueNode);
      this.#changed = true;
    }
  }

  #defeatingArrayMapping(path) {
    const { node, scope } = path;
    const { property } = node;
    if (!property) return;
    if (!t.isNumericLiteral(property)) return;
    const index = property.value;
    const binding = scope.getBinding(node.object.name);
    if (!binding) return;
    if (!t.isVariableDeclarator(binding.path.node)) return;
    if (!t.isArrayExpression(binding.path.node.init)) return;
    let array = binding.path.node.init;
    if (index >= array.length) return;
    let member = array.elements[index];
    if (t.isLiteral(member)) {
      path.replaceWith(member);
      this.#changed = true;
    }
  }

  #transformBracketToDot(path) {
    const { node } = path;
    let { property } = node.callee;
    if (t.isStringLiteral(property)) {
      node.callee.property = t.identifier(property.value);
      node.callee.computed = false;
      this.#changed = true;
    }
  }

  #changeEmptyElementToUndefined(path) {
    for (const element of path.get("elements")) {
      if (!element.node) {
        element.replaceWith(t.valueToNode(undefined));
        this.#changed = true;
      }
    }
  }

  #evaluateConditionalStatement(path) {
    const isTruthy = path.get("test").evaluateTruthy();
    const { consequent, alternate } = path.node;
    if (isTruthy == undefined) return;
    if (isTruthy) {
      this.#replaceWithBody(path, consequent);
    } else if (alternate != null) {
      this.#replaceWithBody(path, alternate);
    } else {
      path.remove();
    }
    this.#changed = true;
  }

  #replaceWithBody(path, branch) {
    if (t.isBlockStatement(branch)) {
      path.replaceWithMultiple(branch.body);
    } else {
      path.replaceWith(branch);
    }
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
    return output.code;
  }
}
