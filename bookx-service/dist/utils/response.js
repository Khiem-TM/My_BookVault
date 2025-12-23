"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message = "Success", code = 1000) => {
    return {
        code,
        message,
        result: data
    };
};
exports.successResponse = successResponse;
const errorResponse = (message, code = 9999) => {
    return {
        code,
        message
    };
};
exports.errorResponse = errorResponse;
