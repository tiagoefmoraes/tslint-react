/**
 * @license
 * Copyright 2016 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require("tslint");
var ts = require("typescript");
var OPTION_ALWAYS = "always";
var OPTION_NEVER = "never";
var SPACING_VALUES = [OPTION_ALWAYS, OPTION_NEVER];
/* tslint:disable:object-literal-sort-keys */
var SPACING_OBJECT = {
    type: "string",
    enum: SPACING_VALUES,
};
/* tslint:enable:object-literal-sort-keys */
var newLineRegexp = /\n/;
function isExpressionMultiline(text) {
    return newLineRegexp.test(text);
}
function getTokensCombinedText(firstToken, nextToken) {
    var parentNodeText = nextToken.parent.getText();
    var firstTokenText = firstToken.getText();
    var secondTokenText = nextToken.getText();
    var secondTokenTextLocation = parentNodeText.indexOf(secondTokenText);
    var firstTokenTextLocation = parentNodeText.indexOf(firstTokenText);
    var combinedTokeText = parentNodeText.slice(firstTokenTextLocation, secondTokenTextLocation + secondTokenText.length);
    return combinedTokeText;
}
function isSpaceBetweenTokens(first, second) {
    var text = first.parent.getText().slice(first.end - first.parent.getStart(), second.getStart() - second.parent.getStart());
    return /\s/.test(text.replace(/\/\*.*?\*\//g, ""));
}
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new JsxCurlySpacingWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    /* tslint:disable:object-literal-sort-keys */
    Rule.metadata = {
        ruleName: "jsx-curly-spacing",
        description: "Checks JSX curly braces spacing",
        optionsDescription: (_a = ["\n            One of the following two options must be provided:\n\n            * `\"", "\"` requires JSX attributes to have spaces between curly braces\n            * `\"", "\"` requires JSX attributes to NOT have spaces between curly braces"], _a.raw = ["\n            One of the following two options must be provided:\n\n            * \\`\"", "\"\\` requires JSX attributes to have spaces between curly braces\n            * \\`\"", "\"\\` requires JSX attributes to NOT have spaces between curly braces"], Lint.Utils.dedent(_a, OPTION_ALWAYS, OPTION_NEVER)),
        options: {
            type: "array",
            items: [SPACING_OBJECT],
            minLength: 1,
            maxLength: 1,
        },
        optionExamples: [
            ("[true, \"" + OPTION_ALWAYS + "\"]"),
            ("[true, \"" + OPTION_NEVER + "\"]"),
        ],
        type: "style",
        typescriptOnly: true,
    };
    /* tslint:enable:object-literal-sort-keys */
    Rule.FAILURE_NO_ENDING_SPACE = function (tokenStr) {
        return "A space is required before " + tokenStr;
    };
    Rule.FAILURE_NO_BEGINNING_SPACE = function (tokenStr) {
        return "A space is required after " + tokenStr;
    };
    Rule.FAILURE_FORBIDDEN_SPACES_BEGINNING = function (tokenStr) {
        return "There should be no space after " + tokenStr;
    };
    Rule.FAILURE_FORBIDDEN_SPACES_END = function (tokenStr) {
        return "There should be no space before " + tokenStr;
    };
    return Rule;
    var _a;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var JsxCurlySpacingWalker = (function (_super) {
    __extends(JsxCurlySpacingWalker, _super);
    function JsxCurlySpacingWalker() {
        _super.apply(this, arguments);
    }
    JsxCurlySpacingWalker.prototype.visitJsxExpression = function (node) {
        this.validateBraceSpacing(node);
        _super.prototype.visitJsxExpression.call(this, node);
    };
    JsxCurlySpacingWalker.prototype.visitNode = function (node) {
        if (node.kind === ts.SyntaxKind.JsxSpreadAttribute) {
            this.validateBraceSpacing(node);
        }
        _super.prototype.visitNode.call(this, node);
    };
    JsxCurlySpacingWalker.prototype.validateBraceSpacing = function (node) {
        var firstToken = node.getFirstToken();
        var secondToken = node.getChildAt(1);
        var lastToken = node.getLastToken();
        var secondToLastToken = node.getChildAt(node.getChildCount() - 2);
        var nodeStart = node.getStart();
        var nodeWidth = node.getWidth();
        if (this.hasOption(OPTION_ALWAYS)) {
            if (!isSpaceBetweenTokens(firstToken, secondToken)) {
                var failureString = Rule.FAILURE_NO_BEGINNING_SPACE(firstToken.getText());
                this.addFailure(this.createFailure(nodeStart, 1, failureString));
            }
            if (!isSpaceBetweenTokens(secondToLastToken, lastToken)) {
                var failureString = Rule.FAILURE_NO_ENDING_SPACE(lastToken.getText());
                this.addFailure(this.createFailure(nodeStart + nodeWidth - 1, 1, failureString));
            }
        }
        else if (this.hasOption(OPTION_NEVER)) {
            var firstAndSecondTokensCombinedText = getTokensCombinedText(firstToken, secondToken);
            var lastAndSecondToLastCombinedText = getTokensCombinedText(secondToLastToken, lastToken);
            if (!isExpressionMultiline(firstAndSecondTokensCombinedText)) {
                if (isSpaceBetweenTokens(firstToken, secondToken)) {
                    var failureString = Rule.FAILURE_FORBIDDEN_SPACES_BEGINNING(firstToken.getText());
                    this.addFailure(this.createFailure(nodeStart, 1, failureString));
                }
            }
            if (!isExpressionMultiline(lastAndSecondToLastCombinedText)) {
                if (isSpaceBetweenTokens(secondToLastToken, lastToken)) {
                    var failureString = Rule.FAILURE_FORBIDDEN_SPACES_END(lastToken.getText());
                    this.addFailure(this.createFailure(nodeStart + nodeWidth - 1, 1, failureString));
                }
            }
        }
    };
    return JsxCurlySpacingWalker;
}(Lint.RuleWalker));
