import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
export declare class AuditInterceptor implements NestInterceptor {
    private prisma;
    private reflector;
    private readonly logger;
    constructor(prisma: PrismaService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private extractResource;
    private extractResourceId;
    private logAudit;
}
