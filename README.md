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
console.log(deobfuscatedCode)
```
Or if you want to use a file:
```javascript
import deobfuscate from "@lorenzoferre/deobfuscator";
import fs from "fs";

const path = ""; // Insert the file path
const code = fs.readFileSync(path, "utf-8");
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode)
```
 
# Techniques
### Remove dead code
It removes parts of the code that are deemed unecessary, such as variables or functions, an example:
```javascript
function a() {} 
function b() {a();} 
function c() {a(); b();} 
console.log("a");
```
The result:
```javascript
console.log("a");
```
 _a_ function is called by both _b_ and _c_, _b_ is called by _c_, but _c_ is not called by anyone, so none of these functions are actually called.
### Rename variables in the same scope
It aims to make the code more readable, an example:
```javascript
let x = 0; 
{ 
    let x = 30;
    x += 1; 
}
x += 1;
```
The result:
```javascript
let x = 0; 
{ 
    let _x = 30;
    _x += 1; 
}
x += 1;
```
Only the variabile _x_ changes within the block statement to avoid any confusion with the global variable _x_.
### Constant propagation
It propagates constant values across all occurrences, an example:
```javascript
var a = 1;
console.log(a)
```
The result:
```javascript
console.log(1)
```
After propagating the value, this technique removes the variable declaration.
A counterexample:
```javascript
var a = 1;
a += 1;
console.log(a)
```
Whenever there is an update or assignment expression, the variable is no longer considered constant, and, as a result, we cannot propagate the value.
### Evaluation
It evaluates expressions that consist solely of constant values, an example:
```javascript
console.log(1 + 1);
console.log("hello".replace("h","H"));
console.log(parseInt("1"));
```
The result:
```javascript
console.log(2);
console.log("Hello";
console.log(1);
```
### Replace single constant violations
It replaces all assignments that violate the constant property with variable declarations. As mentioned earlier, whenever there is at least one assignment, the variable can no longer be considered constant. Therefore, this technique allows for the creation of constant variable declarations.
An example:
```javascript
var a;
a = 1;
```
The result:
```javascript

var a = 1;
```
### Replace outermost iife
It extracts the body of the outermost IIFE and replaces it with this one,
an example:
```javascript
(function () { console.log(5);})();
```
Or
```javascript
(() => { console.log(5);})();
```
The result is the same in both cases:
```javascript
console.log(5);
```
But if there is a return statement inside the IIFE, it remains unchanged.
### Defeating array mapping
It replaces member expressions that access array elements with their corresponding values. However, the value inside the array must be a node of the literal type. Here's an example.
```javascript
var _0xa=["feel","log","free","to contribute"];
console[_0xa[1]](_0xa[0]);
console[_0xa[1]](_0xa[2]);
console[_0xa[1]](_0xa[3]);
```
The result:
```javascript
console.log("feel");
console.log("free");
console.log("to contribute");
```
### Defeating object mapping
It's similar to defeating array mapping, but it applies to objects, an example:
```javascript
var obj = {"a": 1};
console.log(obj.a);
```
The result:
```javascript
console.log(1);
```

### Transform bracket into dot notation
It converts bracket notation into dot notation. Here's an example:
```javascript
console.log("hello"["replace"]("h","H"));
```
The result:
```javascript
console.log("hello".replace("h","H"));
```

### Replace null values with undefined
It replaces null values with undefined for later evaluation, an example:
```javascript
console.log(+([[[[[[]], , ,]]]] != 0));
```
The result:
```javascript
console.log(+([[[[[[]],undefined,undefined,]]]] != 0));
```
The evaluation of the last piece of code is as follows:
```javascript
console.log(1);
```
### Evaluate conditional statements
It checks whether the test value of if or ternary operators is always true or false. In the first case it replaces the entire if statement with the true branch, and in the second case, it replaces it with the false branch.
An example:
```javascript
if (1 == 1) { console.log("1 == 1"); }
```
The result:
```javascript
console.log("1 == 1");
```
Another example:
```javascript
if (1 != 1) { console.log("1 == 1"); } else {}
```
The result:
```javascript

```
### Control flow unflattening
It reconstructs the regular flow of the code. In special cases it may need to incorporate assignments into variable declarations, such as in the case of a single constant violation, and then move them before loops. This enables the propagation of variables when they are declared with a literal type node.
##### Move declarations before loops
If you declare variables inside loops, they are not considered constant. In fact, this technique relocates declarations before loops. Here's an example:
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
The result:
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
#### Control flow unflattening
This technique checks whether the switch test variable identifier is associated with a variable declared using a literal type node. By identifying this value, you can determine which case is accessed first. Once the first one is determined, the test variable's identifier is searched to obtain the next value, allowing access to the next switch case and so on.
### Remove empty statements
It removes empty elements, an example:
```javascript
;;;console.log(1);;;
```
The result:
```javascript
console.log(1);
```
# To do
I would like to retrieve the results returned by functions, as follows:
```javascript
function add(a, b) {
    return a + b;
}
console.log(add(1,1));
```
The expected result:
```javascript
console.log(2);
```
Evaluate dynamic expressions:
```javascript
var a = 1;
a += 1;
console.log(a);
```
The expected result:
```javascript
console.log(2);
```
Evaluate a special case of Jsfuck notation like the following:
```javascript
console.log(([]["flat"] +[])[1]);
```
The expected result:
```javascript
console.log("u");
```
Feel free to contribute; I would greatly appreciate it. My goal is to create a deobfuscator that is as versatile as possible. In fact, when I learn to use the _vm_ module, the part of the code responsible for control flow unflattening will need to be rewritten.