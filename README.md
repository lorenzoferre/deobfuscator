![](https://github.com/lorenzoferre/javascript-deobfuscator/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Javascript deobfuscator
# Usage
First of all you need to install the package:
```
npm i @lorenzoferre/deobfuscator
```
Then you import the deobfuscation function into your module which takes the obfuscated code as input:
```javascript
import deobfuscate from "@lorenzoferre/deobfuscator";
const code = `` // Insert the code here
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode.code)
```
Or if you want to use a file:
```javascript
import deobfuscate from "@lorenzoferre/deobfuscator";
import fs from "fs";

const path = ""; // Insert the file path
const code = fs.readFileSync(path, "utf-8");
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode.code)
```
 
# Techniques
### Remove dead code
It removes parts of the code that are useless.
These could be variables or functions, an example:
```javascript
function a() {} 
function b() {a();} 
function c() {a(); b();} 
console.log("a");
```
Result:
```javascript
console.log("a");
```
 _a_ function is called by _b_ and _c_, _b_ is called by _c_, but _c_ is not called by anyone, so none of these functions are called.
### Rename variables in the same scope
It aims to make the code more readble, an example:
```javascript
let x = 0; 
{ 
    let x = 30;
    x += 1; 
}
x += 1;
```
Result:
```javascript
let x = 0; 
{ 
    let _x = 30;
    _x += 1; 
}
x += 1;
```
Only the variabile _x_ changes within the block statement to avoid misunderstanding with the global variable _x_.
### Constant propagation
It propagates constant values across all occurrences, an example:
```javascript
var a = 1;
console.log(a)
```
Result:
```javascript
console.log(1)
```
Once the value is propagated, this technique deletes the variable declaration.
A counterexample:
```javascript
var a = 1;
a += 1;
console.log(a)
```
Every time there is at least one update or assignment expression the variable is no longer constant, so we can't propagate the value.
### Evaluation
It evaluates all expressions that contain only constant values, an example:
```javascript
console.log(1 + 1);
console.log("hello".replace("h","H"));
console.log(parseInt("1"));
```
Result:
```javascript
console.log(2);
console.log("Hello";
console.log(1);
```
### Replace single constant violations
It replaces all assignments, which are single constant violations, with variable declarations.
As I said before every time thare is at least one assignment the variable is no longer constant, so with this technique it is possible to make a constant variable declaration.
An example:
```javascript
var a;
a = 1;
```
Result:
```javascript

var a = 1;
```
### Replace outermost iife
It extracts the body of the outermost iife and replace all with this one,
an example:
```javascript
(function () { console.log(5);})();
```
Or
```javascript
(() => { console.log(5);})();
```
Result in both cases is the same:
```javascript
console.log(5);
```
But if there is a return into the iife, it remeins unchanged.
### Defeating array mapping
It replaces member expressions that access the elements of an array with its value.
The value inside the array must be a node of type literal though.
An example:
```javascript
var _0x3baf=["Hello Venus","log","Hello Earth","Hello Mars"];
console[_0x3baf[1]](_0x3baf[0]);
console[_0x3baf[1]](_0x3baf[2]);
console[_0x3baf[1]](_0x3baf[3]);
```
Result:
```javascript
console.log("Hello Venus");console.log("Hello Earth");console.log("Hello Mars");
```
### Transform brackets notation into dots notation
It transforms the brackets notation into dots notation, an example:
```javascript
console.log("hello"["replace"]("h","H"));
```
Result:
```javascript
console.log("hello".replace("h","H"));
```
This transformation does not occur when accessing the attributes of an object or array element, an example:
```javascript
var obj = {"a":1, "b":2};
console.log(obj["a"]);
```
In this case it is not transformed into _obj.a_
### Replace null values with undefined
It replaces null values with undefined to be evaluated later, an example:
```javascript
console.log(+([[[[[[]], , ,]]]] != 0));
```
Result:
```javascript
console.log(+([[[[[[]],undefined,undefined,]]]] != 0));
```
The evaluation of the last piece of code:
```javascript
console.log(1);
```
### Evaluate conditional statements
It checks wheater the test value of if or ternary operators is always true or false.
In the first case it replaces the entire if statement with the true branch, in the second with the false branch.
An example:
```javascript
if (1 == 1) { console.log("1 == 1"); }
```
Result:
```javascript
console.log("1 == 1");
```
Another example:
```javascript
if (1 != 1) { console.log("1 == 1"); } else {}
```
Result:
```javascript

```
### Control flow unflattening
It reconstructs the normal flow of the code.
In special cases it must embed the assignments in the variable declarations (as in the case of the single constant violation) and then move them before loops.
In this way variables can be propagated if they are declared with a literal type node.
##### Move declarations before loops
If you declare variables inside loops they are not constant.
In fact this technique moves declarations before loops, an example:
```javascript
var a = 1;
var b,c;
do {
switch(a) {
case 1: { a = 3; } break;
case 2: { c = a * b; } break;
case 3: { b = 10; a = 2; } break;
}
}while(c != 20);
console.log(c);
```
Result:
```javascript
var c = a * b;
var b = 10;
do {
  switch (a) {
    case 1:
      {
        a = 3;
      }
      break;
    case 2:
      {}
      break;
    case 3:
      {
        a = 2;
      }
      break;
  }
} while (c != 20);
console.log(c);
```
#### Main technique
This technique verifies that the switch test variable identifier refers to a variable declared with a literal type node.
So by finding this value you can understand which case is accessed first.
Once the first one has been understood, the identifier of the test variable is searched to obtain the next value and consequently access to the next switch case and so on.
### Remove empty statements
It removes empty elements, an example:
```javascript
;;;console.log(1);;;
```
Result:
```javascript
console.log(1);
```
# To do
I would like to get the results returned by functions:
```javascript
function add(a, b) {
    return a + b;
}
console.log(add(1,1));
```
Exprected result:
```javascript
console.log(2);
```
Evaluate dynamic expressions:
```javascript
var a = 1;
a += 1;
console.log(a);
```
Expected result:
```javascript
console.log(2);
```
Evaluate a special case of Jsfuck notation like this:
```javascript
console.log(([]["flat"] +[])[1]);
```
Expected result:
```javascript
console.log("u");
```
Feel free to contribute, I would really appreciate it.
My goal is to build a deobfuscator that is as general as possible, in fact when I learn to use the _vm_ module the part of the code that deals with control flow unflattening will have to be rewritten.