import { traverse } from "@babel/core";

export default function deleteIrrelevantFields(ast) {
	traverse(ast, {
		exit(path) {
			delete path.node.start;
			delete path.node.end;
			delete path.node.loc;
			delete path.node.extra;
		}
	});
}