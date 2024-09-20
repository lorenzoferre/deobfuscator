![](https://github.com/lorenzoferre/javascript-deobfuscator/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Javascript deobfuscator
# Usage
First of all you need to install the package:
```
npm i javascript-deob
```
Then you import the deobfuscation function into your module which takes the obfuscated code as input:
```javascript
import deobfuscate from "javascript-deob";
const code = `` // Insert the code here
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode)
```
Or if you want to use a file:
```javascript
import deobfuscate from "javascript-deob";
import fs from "fs";

const path = ""; // Insert the file path
const code = fs.readFileSync(path, "utf-8");
const deobfuscatedCode = deobfuscate(code)
console.log(deobfuscatedCode)
```
 
# Techniques
There are both static and dynamic techniques, meaning they use the _vm_ module.
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

### Reconstruct variable declarations
This reconstructs a variable declaration with multiple declarations into separate declarations, each with only one variable. For example:
```javascript
var a, b, c = 5;
```
The result:
```javascript
var a;
var b;
var c = 5;
```

### Insert variables within the context
It is used to save the variables within the context, allowing for the tracking of variable values and the evaluation of expressions (even when they do not contain only constant values).

### Control flow unflattening
This technique reconstructs the regular flow of the code. It checks whether the switch test variable identifier is within the _vm_ context. By identifying this value, you can determine which case is accessed first. Once the first case is identified, the test variable's identifier is searched to obtain the next value, allowing access to the next switch case, and so on. Here's an example:
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
var a = 1;
var b;
var c;
a = 3;
b = 10;
a = 2;
c = a * b;
console.log(c);
```

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

### Evaluate
## Static evaluation
It evaluates expressions that consist solely of constant values, an example:
```javascript
console.log(1 + 1);
console.log("hello".replace("h","H"));
console.log(parseInt("1"));
```
The result:
```javascript
console.log(2);
console.log("Hello");
console.log(1);
```
## Dynamic evaluation
If the expressions do not contain constant values and cannot be evaluated through `path.evaluate()` of Babel, the plugin checks if the variable is within the context and tries to evaluate it using `vm.runInContext(...)`. If the result is not `undefined` and it is not a `function`, the context is updated, and in some cases, the node is replaced. Here’s an example:
```javascript
var a = 5;
a += 1;
console.log(a);
```
The result:
```javascript
console.log(6);
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

### Transform sequence expression
It transforms sequence expressions into expression statements. Here's an example:
```javascript
  var a = 1;
  var b = 1;
  a = 2, b = 2;
```
The result:
```javascript
var a = 1;
var b = 1;
a = 2;
b = 2;
```
This plugin is only for improving code readability

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

### Evaluate Function
This plugin evaluates the results of the function if it is within the context and if the arguments of the call expression contain all literal node types. Here’s an example:
```javascript
function add(a, b) {
    return a + b;
}
console.log(add(1,1));
```
The result:
```javascript
console.log(2);
```

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
Whenever there is an update or assignment expression, the variable is no longer considered constant, and, as a result, we cannot propagate the value.

### Remove empty statements
It removes empty elements, an example:
```javascript
;;;console.log(1);;;
```
The result:
```javascript
console.log(1);
```

### WORK IN PROGRESS
Evaluate a special case of Jsfuck notation like the following:
```javascript
console.log(([]["flat"] +[])[1]);
```
The expected result:
```javascript
console.log("u");
```
Feel free to contribute; I would greatly appreciate it. My goal is to create a deobfuscator that is as versatile as possible. In fact, when I learn to use the _vm_ module, the part of the code responsible for control flow unflattening will need to be rewritten.