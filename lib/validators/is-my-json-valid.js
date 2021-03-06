'use strict';


var imjv = require('is-my-json-valid')
    , stableStringify = require('json-stable-stringify')
    , util = require('./_util');


module.exports = Validator;


function Validator(opts) {
    if (!(this instanceof Validator)) return new Validator(opts);
    var self = this;

    this._opts = convertOpts(opts);
    var _schemas = this._opts.schemas = this._opts.schemas || {};
    this._compiled = {};

    // this is done on purpose, so that methods are bound to the instance without using bind
    this.validate = validate;
    this.compile = compile;
    this.addSchema = addSchema;
    this.getSchema = getSchema;

    for (var id in _schemas) _schemas[id] = util.parse(_schemas[id]);


    function validate(schema, json) {
        var v = compile(schema);
        return v(json);
    }


    function compile(schema) {
        schema = util.parse(schema);
        var schemaStr = stableStringify(schema);
        var v = self._compiled[schemaStr];
        if (!v) v = self._compiled[schemaStr] = imjv(schema, self._opts);

        return function validate(json) {
            var result = v(json);
            return { valid: result, errors: v.errors || [] };
        };
    }


    function addSchema(schema, id) {
        schema = util.parse(schema);
        if (Array.isArray(schema))
            return schema.forEach(function(s) { addSchema(s); }); // !!! second parameter must be undefined, so you can't just pass addSchema to forEach
        var id = id || schema.id;
        _schemas[id] = schema;
    }


    function getSchema(id) {
        return _schemas[id];
    }
}


function convertOpts(opts) {
    var _opts = opts ? util.copy(opts) : {};
    _opts.greedy = _opts.allErrors;
    return _opts;
}
