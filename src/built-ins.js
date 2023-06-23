import * as t from "@babel/types";

export var globalFunctions = new Map();
globalFunctions.set("isFinite", () => { return t.memberExpression(t.identifier("Number"), t.identifier("isFinite"), false); });
globalFunctions.set("isNaN", () => { return t.memberExpression(t.identifier("Number"), t.identifier("isNaN"), false); });
globalFunctions.set("parseFloat", () => { return t.memberExpression(t.identifier("Number"), t.identifier("parseFloat"), false); });
globalFunctions.set("parseInt", () => { return t.memberExpression(t.identifier("Number"), t.identifier("parseInt"), false); });

globalFunctions.set("decodeURI", () => { return t.memberExpression(t.identifier("String"), t.identifier("decodeURI"), false); });
globalFunctions.set("decodeURIComponent", () => { return t.memberExpression(t.identifier("String"), t.identifier("decodeURIComponent"), false); });
globalFunctions.set("encodeURI", () => { return t.memberExpression(t.identifier("String"), t.identifier("encodeURI"), false); });
globalFunctions.set("encodeURIComponent", () => { return t.memberExpression(t.identifier("String"), t.identifier("encodeURIComponent"), false); });