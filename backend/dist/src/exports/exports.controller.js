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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exports_service_1 = require("./exports.service");
const export_dto_1 = require("./dto/export.dto");
const jwt_strategy_1 = require("../auth/jwt.strategy");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ExportsController = class ExportsController {
    exportsService;
    constructor(exportsService) {
        this.exportsService = exportsService;
    }
    async exportSales(query, res) {
        return this.exportsService.exportSales(query, res);
    }
    async exportProducts(query, res) {
        return this.exportsService.exportProducts(query, res);
    }
    async exportCustomers(query, res) {
        return this.exportsService.exportCustomers(query, res);
    }
    async exportInventory(query, res) {
        return this.exportsService.exportInventory(query, res);
    }
};
exports.ExportsController = ExportsController;
__decorate([
    (0, common_1.Post)('sales'),
    (0, roles_decorator_1.Roles)('ADMIN', 'CASHIER'),
    (0, swagger_1.ApiOperation)({ summary: 'Export sales data' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_dto_1.ExportQueryDto, Response]),
    __metadata("design:returntype", Promise)
], ExportsController.prototype, "exportSales", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, roles_decorator_1.Roles)('ADMIN', 'INVENTORY_USER'),
    (0, swagger_1.ApiOperation)({ summary: 'Export products data' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_dto_1.ExportQueryDto, Response]),
    __metadata("design:returntype", Promise)
], ExportsController.prototype, "exportProducts", null);
__decorate([
    (0, common_1.Post)('customers'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Export customers data' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_dto_1.ExportQueryDto, Response]),
    __metadata("design:returntype", Promise)
], ExportsController.prototype, "exportCustomers", null);
__decorate([
    (0, common_1.Post)('inventory'),
    (0, roles_decorator_1.Roles)('ADMIN', 'INVENTORY_USER'),
    (0, swagger_1.ApiOperation)({ summary: 'Export inventory movements data' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_dto_1.ExportQueryDto, Response]),
    __metadata("design:returntype", Promise)
], ExportsController.prototype, "exportInventory", null);
exports.ExportsController = ExportsController = __decorate([
    (0, swagger_1.ApiTags)('Exports'),
    (0, common_1.Controller)('exports'),
    (0, common_1.UseGuards)(jwt_strategy_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [exports_service_1.ExportsService])
], ExportsController);
//# sourceMappingURL=exports.controller.js.map