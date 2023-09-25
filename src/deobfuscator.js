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
      // costant propagation
      VariableDeclarator(path) {
        self.#renameVariableSameScope(path);
        self.#constantPropagation(path);
      },
      // evaluate the expressions with constant values
      "BinaryExpression|UnaryExpression|LogicalExpression"(path) {
        self.#evaluate(path);
      },
      ExpressionStatement(path) {
        self.#replaceSingleConstantViolation(path);
        self.#moveDeclarationsBeforeLoop(path);
        self.#replaceOutermostIife(path);
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
      // evaluate if there are statements and ternary statements
      "IfStatement|ConditionalExpression"(path) {
        self.#evaluateConditionalStatement(path);
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
    const { node, scope } = path;
    const { id, init } = node;
    if (!t.isLiteral(init) && !t.isUnaryExpression(init)) return;
    const binding = scope.getBinding(id.name);
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

  #replaceSingleConstantViolation(path) {
    const { node, scope } = path;
    const { expression } = node;
    if (!t.isAssignmentExpression(expression)) return;
    const { left, right } = expression;
    const binding = scope.getBinding(left.name);
    if (!binding) return;
    if (binding.scope !== scope) return;
    if (!this.#hasSingleConstantViolation(binding, expression)) return;
    const declaration = t.variableDeclaration("var", [t.variableDeclarator(left, right)]);
    binding.path.remove();
    path.replaceWith(declaration);
    this.#changed = true;
  }

  #moveDeclarationsBeforeLoop(path) {
    const { node, scope } = path;
    const { expression } = node;
    if (!t.isAssignmentExpression(expression)) return;
    const { left, right } = expression;
    const binding = scope.getBinding(left.name);
    if (!binding) return;
    if (binding.scope === scope) return;
    if (!this.#hasSingleConstantViolation(binding, expression)) return;
    const declaration = t.variableDeclaration("var", [t.variableDeclarator(left, right)]);
    const switchStatementPath = path.find(path => path.isSwitchStatement());
    if (!switchStatementPath) return;
    const loopStatementPath = switchStatementPath.find(
      path => path.isWhileStatement() || path.isDoWhileStatement()
    );
    if (!loopStatementPath) return;
    loopStatementPath.insertBefore(declaration);
    binding.path.remove();
    path.remove();
    this.#changed = true;
  }

  #hasSingleConstantViolation(binding, expression) {
    if (!t.isVariableDeclarator(binding.path.node)) return;
    if (binding.path.node.init !== null) return;
    if (binding.kind !== "var") return;
    if (binding.constantViolations.length !== 1) return;
    if (expression !== binding.constantViolations[0].node) return;
    return true;
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
    const switchBlocks = this.#buildSwitchBlocks(switchStatement);
    let stuffInOrder = [];
    for (let i = 0; i < Object.keys(switchBlocks).length; i++) {
      let blocksByCase = switchBlocks[value];
      if (!blocksByCase) return;
      for (const block of blocksByCase) {
        if (!t.isBlockStatement(block)) continue;
        for (let statement of block.body) {
          stuffInOrder.push(statement);
          const nextValue = this.#getNextValue(statement, name);
          if (!nextValue) continue;
          value = nextValue;
          blocksByCase = switchBlocks[value];
        }
      }
    }
    path.replaceWithMultiple(stuffInOrder);
    this.#changed = true;
  }

  #buildSwitchBlocks(switchStatement) {
    let switchBlocks = {};
    for (const switchCase of switchStatement.cases) {
      const key = switchCase.test.value || switchCase.test.name;
      switchBlocks[key] = switchCase.consequent;
    }
    return switchBlocks;
  }

  #getNextValue(statement, name) {
    if (!t.isExpressionStatement(statement)) return;
    const { expression } = statement;
    if (!t.isAssignmentExpression(expression)) return;
    const { left, right } = expression;
    if (left.name !== name) return;
    // the right node could be a literal or an identifier
    return right.value || right.name;
  }

  #generateOutputCode() {
    const output = generate(this.#ast, { comments: false });
    return output.code;
  }
}
