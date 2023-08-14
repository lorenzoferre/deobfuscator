import * as t from "@babel/types";

export default function replaceOutermostIife(path) {
	if (!t.isProgram(path.parent)) return;
	let node = path.node;
	let expr = node.expression;
	if (!t.isCallExpression(expr)) return;
	let callee = expr.callee;
	if (!t.isFunctionExpression(callee)) return;
	let innerStatements = callee.body.body;
	path.replaceWithMultiple(innerStatements);
}