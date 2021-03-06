/**
 * @fileoverview Tests for callback return rule.
 * @author Jamund Ferguson
 * @copyright 2015 Jamund Ferguson. All rights reserved.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/callback-return"),
    RuleTester = require("../../../lib/testers/rule-tester");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------


var ruleTester = new RuleTester();

ruleTester.run("callback-return", rule, {
    valid: [

        // callbacks inside of functions should  return
        "function a(err) { if (err) return callback (err); }",
        "function a(err) { if (err) return callback (err); callback(); }",
        "function a(err) { if (err) { return callback (err); } callback(); }",
        "function a(err) { if (err) { return /* confusing comment */ callback (err); } callback(); }",
        "function x(err) { if (err) { callback(); return; } }",
        "function x(err) { if (err) { \n log();\n callback(); return; } }",
        "function x(err) { if (err) { callback(); return; } return callback(); }",
        "function x(err) { if (err) { return callback(); } else { return callback(); } }",
        "function x(err) { if (err) { return callback(); } else if (x) { return callback(); } }",
        "function x(err) { if (err) return callback(); else return callback(); }",
        "function x(cb) { cb && cb(); }",
        "function x(next) { typeof next !== 'undefined' && next(); }",
        "function x(next) { if (typeof next === 'function')  { return next() } }",
        "function x() { switch(x) { case 'a': return next(); } }",
        "function x() { for(x = 0; x < 10; x++) { return next(); } }",
        "function x() { while(x) { return next(); } }",

        // callback() all you want outside of a function
        "callback()",
        "callback(); callback();",
        "while(x) { move(); }",
        "for (var i = 0; i < 10; i++) { move(); }",
        "for (var i = 0; i < 10; i++) move();",
        "if (x) callback();",
        "if (x) { callback(); }",

        // arrow functions
        {
            code: "var x = err => { if (err) { callback(); return; } }",
            ecmaFeatures: { arrowFunctions: true }
        },
        {
            code: "var x = err => callback(err)",
            ecmaFeatures: { arrowFunctions: true }
        },
        {
            code: "var x = err => { setTimeout( () => { callback(); }); }",
            ecmaFeatures: { arrowFunctions: true }
        },

        // classes
        {
            code: "class x { horse() { callback(); } } ",
            ecmaFeatures: { classes: true }
        }, {
            code: "class x { horse() { if (err) { return callback(); } callback(); } } ",
            ecmaFeatures: { classes: true }
        },

        // options (only warns with the correct callback name)
        {
            code: "if (err) { callback(err) }",
            options: [["cb"]]
        },
        {
            code: "function a(err) { if (err) { callback(err) } next(); }",
            options: [["cb", "next"]]
        },
        {
            code: "function a(err) { if (err) { return next(err) } else { callback(); } }",
            options: [["cb", "next"]]
        },

        //  known bad examples that we know we are ignoring
        "function x(err) { if (err) { setTimeout(callback, 0); } callback(); }", // callback() called twice
        "function x(err) { if (err) { process.nextTick(function(err) { callback(); }); } callback(); }" // callback() called twice

    ],
    invalid: [
        {
            code: "function a(err) { if (err) { callback (err); } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 30,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function a(callback) { if (typeof callback !== 'undefined') { callback(); } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 63,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function a(callback) { if (typeof callback !== 'undefined') callback();  }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 61,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function a(callback) { if (err) { callback(); horse && horse(); } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 35,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "var x = (err) => { if (err) { callback (err); } }",
            ecmaFeatures: { arrowFunctions: true },
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 31,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "var x = { x(err) { if (err) { callback (err); } } }",
            ecmaFeatures: {objectLiteralShorthandMethods: true},
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 31,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function x(err) { if (err) {\n log();\n callback(err); } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 3,
                column: 2,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "var x = { x(err) { if (err) { callback && callback (err); } } }",
            ecmaFeatures: {objectLiteralShorthandMethods: true},
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 43,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function a(err) { callback (err); callback(); }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 19,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function a(err) { callback (err); horse(); }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 19,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function a(err) { if (err) { callback (err); horse(); return; } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 30,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "var a = (err) => { callback (err); callback(); }",
            ecmaFeatures: { arrowFunctions: true },
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 20,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function a(err) { if (err) { callback (err); } else if (x) { callback(err); return; } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 30,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function x(err) { if (err) { return callback(); }\nelse if (abc) {\ncallback(); }\nelse {\nreturn callback(); } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 3,
                column: 1,
                nodeType: "CallExpression"

            }]
        },
        {
            code: "class x { horse() { if (err) { callback(); } callback(); } } ",
            ecmaFeatures: { classes: true },
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 32,
                nodeType: "CallExpression"
            }]
        },


        // generally good behavior which we must not allow to keep the rule simple
        {
            code: "function x(err) { if (err) { callback() } else { callback() } }",
            errors: [{
                message: "Expected return with your callback function.",
                line: 1,
                column: 30,
                nodeType: "CallExpression"
            }, {
                message: "Expected return with your callback function.",
                line: 1,
                column: 50,
                nodeType: "CallExpression"
            }]
        },
        {
            code: "function x(err) { if (err) return callback(); else callback(); }",
            errors: [
                {
                    message: "Expected return with your callback function.",
                    line: 1,
                    column: 52,
                    nodeType: "CallExpression"
                }
            ]
        },
        {
            code: "() => { if (x) { callback(); } }",
            ecmaFeatures: { arrowFunctions: true },
            errors: [
                {
                    message: "Expected return with your callback function.",
                    line: 1,
                    column: 18,
                    nodeType: "CallExpression"
                }
            ]
        },
        {
            code: "function b() { switch(x) { case 'horse': callback(); } }",
            errors: [
                {
                    message: "Expected return with your callback function.",
                    line: 1,
                    column: 42,
                    nodeType: "CallExpression"
                }
            ]
        },
        {
            code: "function a() { switch(x) { case 'horse': move(); } }",
            options: [["move"]],
            errors: [
                {
                    message: "Expected return with your callback function.",
                    line: 1,
                    column: 42,
                    nodeType: "CallExpression"
                }
            ]
        },

        // loops
        {
            code: "var x = function() { while(x) { move(); } }",
            options: [["move"]],
            errors: [
                {
                    message: "Expected return with your callback function.",
                    line: 1,
                    column: 33,
                    nodeType: "CallExpression"
                }
            ]
        },
        {
            code: "function x() { for (var i = 0; i < 10; i++) { move(); } }",
            options: [["move"]],
            errors: [
                {
                    message: "Expected return with your callback function.",
                    line: 1,
                    column: 47,
                    nodeType: "CallExpression"
                }
            ]
        },
        {
            code: "var x = function() { for (var i = 0; i < 10; i++) move(); }",
            options: [["move"]],
            errors: [
                {
                    message: "Expected return with your callback function.",
                    line: 1,
                    column: 51,
                    nodeType: "CallExpression"
                }
            ]
        }
    ]
});
