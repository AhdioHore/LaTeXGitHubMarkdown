/*jslint node: true */
/*global describe, it */
'use strict';
var assert = require('assert'),
    raw = require('../static/raw.js');

var test_time_out = 1000 * 60 * 10;

describe('Fake', function () {
    describe('#fake_describe', function () {
        it('Fake it', function (done) {
            raw.escape('# Header\nParagraph\n');
            done();
        });
    });
});