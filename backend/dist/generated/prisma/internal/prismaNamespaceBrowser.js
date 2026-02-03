"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.NullableJsonNullValueInput = exports.SortOrder = exports.AuditLogScalarFieldEnum = exports.SaleItemScalarFieldEnum = exports.SaleScalarFieldEnum = exports.CustomerScalarFieldEnum = exports.InventoryMovementScalarFieldEnum = exports.ProductScalarFieldEnum = exports.CategoryScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    Category: 'Category',
    Product: 'Product',
    InventoryMovement: 'InventoryMovement',
    Customer: 'Customer',
    Sale: 'Sale',
    SaleItem: 'SaleItem',
    AuditLog: 'AuditLog'
};
exports.TransactionIsolationLevel = {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
};
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    role: 'role',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.CategoryScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ProductScalarFieldEnum = {
    id: 'id',
    name: 'name',
    sku: 'sku',
    barcode: 'barcode',
    description: 'description',
    costPrice: 'costPrice',
    salePrice: 'salePrice',
    taxRate: 'taxRate',
    stock: 'stock',
    minStock: 'minStock',
    imageUrl: 'imageUrl',
    categoryId: 'categoryId',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.InventoryMovementScalarFieldEnum = {
    id: 'id',
    productId: 'productId',
    type: 'type',
    quantity: 'quantity',
    previousStock: 'previousStock',
    newStock: 'newStock',
    reason: 'reason',
    userId: 'userId',
    saleId: 'saleId',
    createdAt: 'createdAt'
};
exports.CustomerScalarFieldEnum = {
    id: 'id',
    name: 'name',
    documentType: 'documentType',
    documentNumber: 'documentNumber',
    email: 'email',
    phone: 'phone',
    address: 'address',
    segment: 'segment',
    active: 'active',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SaleScalarFieldEnum = {
    id: 'id',
    saleNumber: 'saleNumber',
    customerId: 'customerId',
    subtotal: 'subtotal',
    taxAmount: 'taxAmount',
    discountAmount: 'discountAmount',
    total: 'total',
    paymentMethod: 'paymentMethod',
    amountPaid: 'amountPaid',
    change: 'change',
    status: 'status',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SaleItemScalarFieldEnum = {
    id: 'id',
    saleId: 'saleId',
    productId: 'productId',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    taxRate: 'taxRate',
    discountAmount: 'discountAmount',
    subtotal: 'subtotal',
    total: 'total'
};
exports.AuditLogScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    action: 'action',
    resource: 'resource',
    resourceId: 'resourceId',
    metadata: 'metadata',
    createdAt: 'createdAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullableJsonNullValueInput = {
    DbNull: 'DbNull',
    JsonNull: 'JsonNull'
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: 'DbNull',
    JsonNull: 'JsonNull',
    AnyNull: 'AnyNull'
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map