"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleStatus = exports.PaymentMethod = exports.CustomerSegment = exports.MovementType = exports.Role = void 0;
exports.Role = {
    ADMIN: 'ADMIN',
    CASHIER: 'CASHIER',
    INVENTORY_USER: 'INVENTORY_USER'
};
exports.MovementType = {
    PURCHASE: 'PURCHASE',
    SALE: 'SALE',
    ADJUSTMENT_IN: 'ADJUSTMENT_IN',
    ADJUSTMENT_OUT: 'ADJUSTMENT_OUT',
    DAMAGE: 'DAMAGE',
    RETURN: 'RETURN'
};
exports.CustomerSegment = {
    VIP: 'VIP',
    FREQUENT: 'FREQUENT',
    OCCASIONAL: 'OCCASIONAL',
    INACTIVE: 'INACTIVE'
};
exports.PaymentMethod = {
    CASH: 'CASH',
    CARD: 'CARD',
    TRANSFER: 'TRANSFER'
};
exports.SaleStatus = {
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    RETURNED_PARTIAL: 'RETURNED_PARTIAL'
};
//# sourceMappingURL=enums.js.map