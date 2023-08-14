import * as t from "@babel/types";

export default function evaluate(path) {
	// evaluate globalFunctions
    /*
	if (t.isCallExpression(path)) {
		let calleeName = path.node.callee.name;
		if (globalFunctions.has(calleeName)) {
			if (calleeName === "btoa" || calleeName === "atob") {
				path.replaceWith(globalFunctions.get(calleeName)(path.node.arguments[0].value));
			} else {
				path.node.callee = globalFunctions.get(calleeName)();
			}
		}
	}*/
	let evaluated = path.evaluate();
	if (!evaluated) return;
	if (!evaluated.confident) return;
	
	let value = evaluated.value;
	let valueNode = t.valueToNode(value);

	// NaN and infinity values generates a binary expression
	if (t.isBinaryExpression(valueNode) && t.isNumericLiteral(valueNode.left) && t.isNumericLiteral(valueNode.right)) {
		if (valueNode.right.value === 0) {
			if (valueNode.left.value === 1) {
				path.replaceWith(t.identifier("Infinity"));
				return;
			} else if (valueNode.left.value === 0) {
				path.replaceWith(t.identifier("NaN"));
				return;
			}
		}
	}
	// valueToNode  return an unary expression when value is < 0 
	if (t.isUnaryExpression(valueNode) && value < 0) {
		valueNode = t.numericLiteral(value);
	}
	if (t.isLiteral(valueNode) || t.isArrayExpression(valueNode)) {
		path.replaceWith(valueNode);
	}
}