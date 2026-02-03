"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_ACTION_KEY = void 0;
exports.AuditAction = AuditAction;
const common_1 = require("@nestjs/common");
exports.AUDIT_ACTION_KEY = 'audit_action';
function AuditAction(action) {
    return (0, common_1.SetMetadata)(exports.AUDIT_ACTION_KEY, action);
}
//# sourceMappingURL=audit.decorator.js.map