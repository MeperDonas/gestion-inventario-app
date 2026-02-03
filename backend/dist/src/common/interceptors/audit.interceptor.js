"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
const core_1 = require("@nestjs/core");
const audit_decorator_1 = require("../decorators/audit.decorator");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    prisma;
    reflector;
    logger = new common_1.Logger(AuditInterceptor_1.name);
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    intercept(context, next) {
        const action = this.reflector.getAllAndOverride(audit_decorator_1.AUDIT_ACTION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!action) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        return next.handle().pipe((0, operators_1.tap)(() => {
            void this.logAudit(action, url, method, request);
        }));
    }
    extractResource(url) {
        const segments = url.split('/').filter(Boolean);
        if (segments.length >= 2) {
            return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
        }
        return 'Unknown';
    }
    extractResourceId(response) {
        if (response && typeof response === 'object' && 'id' in response) {
            const id = response.id;
            if (typeof id === 'string' || typeof id === 'number') {
                return String(id);
            }
        }
        if (response && typeof response === 'object' && 'data' in response) {
            const data = response.data;
            if (data.id &&
                (typeof data.id === 'string' || typeof data.id === 'number')) {
                return String(data.id);
            }
        }
        return null;
    }
    async logAudit(action, url, method, request) {
        const user = request['user'];
        if (!user || !user.sub) {
            this.logger.warn(`Skipping audit log for ${action} on ${url}: No authenticated user`);
            return;
        }
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: user.sub,
                    action,
                    resource: this.extractResource(url),
                    resourceId: null,
                    metadata: {
                        method,
                        url,
                        userAgent: request.headers['user-agent'],
                        ip: request.ip,
                        timestamp: new Date().toISOString(),
                    },
                },
            });
            this.logger.log(`Audit: ${action} by ${user.email} on ${url}`);
        }
        catch (error) {
            this.logger.error('Failed to create audit log:', error);
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map