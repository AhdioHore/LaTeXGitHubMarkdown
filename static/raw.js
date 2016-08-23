/*jslint browser: true*/
/*global $, window, console, require, exports, marked*/

if (typeof require === 'function') {
    var marked = require('marked');
}

/**
 * Escape LaTeX formulas in the raw Markdown text.
 * @param {string} raw
 * @return {string}
 */
function escape(text) {
    'use strict';
    var escaped = false,
        begin = -1,
        end = 0,
        iter = -1,
        dollarNum = 0,
        targets = [],
        result = '',
        specialChars = ['\\', '_', '~', '*'];
    while (end < text.length) {
        if (escaped) {
            escaped = false;
            end += 1;
        } else if (text[end] === '\\') {
            escaped = true;
            end += 1;
        } else if (text[end] === '$') {
            if (begin === -1) {
                begin = end;
                while (end < text.length && text[end] === '$') {
                    end += 1;
                }
                dollarNum = end - begin;
                if (dollarNum > 2) {
                    begin = -1;
                }
            } else {
                while (end < text.length && text[end] === '$') {
                    dollarNum -= 1;
                    end += 1;
                }
                if (dollarNum === 0) {
                    for (iter = begin; iter < end; iter += 1) {
                        if (specialChars.indexOf(text[iter]) >= 0) {
                            targets.push(iter);
                        }
                    }
                }
                begin = -1;
            }
        } else {
            end += 1;
        }
    }
    if (targets.length === 0) {
        return text;
    }
    begin = 0;
    for (iter = 0; iter < text.length; iter += 1) {
        if (begin < targets.length && targets[begin] === iter) {
            result += '\\';
            begin += 1;
        }
        result += text[iter];
    }
    return result;
}

if (typeof require === 'function') {
    exports.escape = escape;
}

if (typeof require !== 'function') {
    $(document).ready(function () {
        'use strict';

        /**
         * Get raw Markdown text from the given url in the query string.
         * @param {function} callback
         */
        function getRawContent(callback) {
            var url = window.getParameterByName('url');
            if (!url) {
                url = 'https://raw.githubusercontent.com/CyberZHG/LaTeXGitHubMarkdown/master/README.md';
            }
            $.ajax({
                url: url,
                success: function (data) {
                    window.addRawToDom(data);
                    callback(true, data);
                },
                error: function () {
                    window.addRenderedToDom('<h2>Failed to fetch raw content</h2>' +
                            '<p>Please check your network status.</p>');
                    callback(false);
                }
            });
        }

        getRawContent(function (success, raw) {
            if (success) {
                var url = 'https://api.github.com/markdown',
                    token = localStorage.getItem('latex_github_markdown_access_token'),
                    data = {
                        'text': escape(raw),
                        'mode': 'markdown'
                    };
                if (token) {
                    $('#login').hide();
                    url += '?access_token=' + token;
                    data.access_token = token;
                }
                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'text',
                    data: JSON.stringify(data),
                    success: function (text) {
                        window.addRenderedToDom(text);
                    },
                    error: function () {
                        window.addRenderedToDom('<h2>Failed to render content</h2>' +
                                '<p>Please disable adblock in this site</p>' +
                                '<p>For unauthenticated requests, the rate limit allows you to make up to 60 requests per hour. </p>' +
                                '<p>Please <a target="_blank" href="https://github.com/login/oauth/authorize?client_id=17b967fc39122956bcc2">sign in</a> to continue.</p>');
                    }
                });
            }
        });
    });
}
