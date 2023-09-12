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
    do {
      this.#changed = false;
      this.#removeDeadCode();
      this.#traverseForDeobfuscating();
      this.#ast = babel.parse(generate(this.#ast, { comments: false }).code);
    } while (this.#changed);

    return this.#generateOutputCode();
  }

  #removeDeadCode() {
    let removed;
    do {
      removed = false;
      removed = this.#traverseForRemovingDeadCode(removed);
      this.#ast = babel.parse(generate(this.#ast, { comments: false }).code);
    } while (removed);
  }

  #traverseForRemovingDeadCode(removed) {
    const removeDeadCodeVisitor = {
      "VariableDeclarator|FunctionDeclaration"(path) {
        const { node, scope } = path;
        const binding = scope.getBinding(node.id.name);
        if (!binding) return;
        if (binding.constant && !binding.referenced) {
          path.remove();
          removed = true;
        }
      },
    };
    babel.traverse(this.#ast, removeDeadCodeVisitor);
    return removed;
  }

  #traverseForDeobfuscating() {
    const self = this;
    const deobfuscateVisitor = {
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
      "WhileStatement|DoWhileStatement"(path) {
        self.#controlFlowUnflattening(path);
      },
      EmptyStatement(path) {
        path.remove();
      },
    };
    babel.traverse(this.#ast, deobfuscateVisitor);
  }

  #renameVariableSameScope(path) {
    const { node, scope } = path;
    if (!node) return;
    const { name } = node.id;
    const { parent } = scope;
    if (!parent) return;
    for (const binding in parent.bindings) {
      if (binding === name) {
        const newName = scope.generateUidIdentifier(name);
        scope.rename(name, newName.name);
      }
    }
  }

  #constantPropagation(path) {
    const { id, init } = path.node;
    if (!t.isLiteral(init) && !t.isUnaryExpression(init)) return;
    const binding = path.scope.getBinding(id.name);
    if (!binding) return;
    if (!binding.constant) return;
    for (const referencePath of binding.referencePaths) {
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
    if (isTruthy === undefined) return;
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
    if (body.some(node => t.isReturnStatement(node))) return;
    path.replaceWithMultiple(body);
    this.#changed = true;
  }

  #controlFlowUnflattening(path) {
    const { node, scope } = path;
    const { body } = node.body;
    if (!body) return;
    const switchStatement = body[0];
    if (!t.isSwitchStatement(switchStatement)) return;
    const { discriminant } = switchStatement;
    const binding = scope.getBinding(discriminant.name);
    if (!binding) return;
    if (!t.isLiteral(binding.path.node.init)) return;
    const { name } = binding.path.node.id;
    let { value } = binding.path.node.init;
    let switchBlocks = [];
    for (const switchCase of switchStatement.cases) {
      // the test could be a literal or an identifier
      const key = switchCase.test.value || switchCase.test.name;
      switchBlocks[key] = switchCase.consequent;
    }
    const stuffInOrder = this.#insertInOrder(switchBlocks, value, name);
    if (!stuffInOrder) return;
    path.replaceWithMultiple(stuffInOrder);
    this.#changed = true;
  }

  #insertInOrder(switchBlocks, value, name) {
    let blocksByCase = switchBlocks[value];
    if (!blocksByCase) return;
    let stuffInOrder = [];
    for (let _ in Object.keys(switchBlocks)) {
      for (const block of blocksByCase) {
        if (!t.isBlockStatement(block)) continue;
        for (let statement of block.body) {
          stuffInOrder.push(statement);
          const value = this.#getNextValue(statement, name);
          if (!value) continue;
          blocksByCase = switchBlocks[value];
        }
      }
    }
    return stuffInOrder;
  }

  #getNextValue(statement, name) {
    let value;
    if (!t.isExpressionStatement(statement)) return;
    const { expression } = statement;
    if (!t.isAssignmentExpression(expression)) return;
    const { left, right } = expression;
    if (left.name === name) {
      value = right.value || right.name;
    }
    return value;
  }

  #generateOutputCode() {
    const output = generate(this.#ast, { comments: false });
    return output.code;
  }
}
