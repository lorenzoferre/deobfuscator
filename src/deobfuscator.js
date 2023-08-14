import { parse, traverse } from "@babel/core";
import * as t from "@babel/types";
import _generate from "@babel/generator";
const generate = _generate.default;

import deleteIrrelevantFields from "./delete-irrelevant-fields.js";
import deleteUnreachableFunctions from "./delete-unreachable-functions.js";
import deobfuscate from "./deobfuscate.js";


// var ast;

/*
function unflatteningSwitch(path) {
	let loopStmt = path.node;
	let bodyBlock = loopStmt.body;
	let bodyParts = bodyBlock.body;
	if (bodyParts.length == 0) return;
	if (!t.isSwitchStatement(bodyParts[0])) return;
	let switchStmt = bodyParts[0];
	let switchCases = switchStmt.cases;
	
	let basicBlocksByCase = {};
	
	for (let switchCase of switchCases) {
	  let key = switchCase.test.value;
	  basicBlocksByCase[key] = switchCase.consequent;
	}
	
	let discriminantIdentifier = switchStmt.discriminant.name;
	let parentScope = path.parentPath.scope;
	let binding = parentScope.getBinding(discriminantIdentifier);
	
	let discriminantValue = binding.path.node.init.value;
  
	// it must be finished
}*/

function initialize() {
	let ast = parse(code);
	deleteUnreachableFunctions(ast);
	deleteIrrelevantFields(ast);
	return ast;
}

 
export function processDeobfuscation(code) {
	let ast = initialize();
	deobfuscate(ast);
	const output = generate(ast, {comments: false});
	return output.code
}

const code = 
`
var a = "a|b|c";
console.log(a.split("|"));
`;
const cleanCode = processDeobfuscation(code);
console.log(cleanCode);