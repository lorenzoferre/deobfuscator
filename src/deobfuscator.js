import { parse, traverse } from "@babel/core";
import _generate from "@babel/generator";
const generate = _generate.default;

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
const code = 
`
function dead1(a, b) {
    return a + b + 1;
}

function dead2() {
    console.log("!!");
}

function dead3() {
    dead1(1, 2);
    dead2();
}

console.log("Hello");
`;
 
export function execute() {
	let ast = parse(code);
	deobfuscate(ast);
	const output = generate(ast, { comments: false });
	return output.code
}

const cleanCode = execute();
console.log(cleanCode);