import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.getAllAndOverride<string>(AUDIT_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(() => {
        void this.logAudit(action, url, method, request);
      }),
    );
  }

  private extractResource(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
    }
    return 'Unknown';
  }

  private extractResourceId(response: unknown): string | null {
    if (response && typeof response === 'object' && 'id' in response) {
      const id = response.id;
      if (typeof id === 'string' || typeof id === 'number') {
        return String(id);
      }
    }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data as { id?: unknown };
      if (
        data.id &&
        (typeof data.id === 'string' || typeof data.id === 'number')
      ) {
        return String(data.id);
      }
    }
    return null;
  }

  private async logAudit(
    action: string,
    url: string,
    method: string,
    request: Request,
  ): Promise<void> {
    const user = request['user'] as {
      sub: string;
      email: string;
      role: string;
    };

    if (!user || !user.sub) {
      this.logger.warn(
        `Skipping audit log for ${action} on ${url}: No authenticated user`,
      );
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
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }
}
