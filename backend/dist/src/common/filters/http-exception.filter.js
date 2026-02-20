"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_SERVER_ERROR';
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' &&
                exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                message = responseObj.message ?? message;
                details = responseObj.error ?? details;
            }
            code = exception.constructor.name.toUpperCase().replace('EXCEPTION', '');
        }
        else if (exception instanceof library_1.PrismaClientKnownRequestError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            switch (exception.code) {
                case 'P2002':
                    message = 'Unique constraint failed';
                    code = 'DUPLICATE_RECORD';
                    break;
                case 'P2025':
                    message = 'Record not found';
                    code = 'NOT_FOUND';
                    status = common_1.HttpStatus.NOT_FOUND;
                    break;
                case 'P2003':
                    message = 'Foreign key constraint failed';
                    code = 'FOREIGN_KEY_ERROR';
                    break;
                default:
                    message = 'Database request failed';
                    code = 'DATABASE_ERROR';
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            code = 'ERROR';
        }
        const errorResponse = {
            success: false,
            error: {
                code,
                message,
                details,
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            },
        };
        this.logger.error(`${request.method} ${request.url} - Status: ${status} - Error: ${message}`, exception instanceof Error ? exception.stack : exception);
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map