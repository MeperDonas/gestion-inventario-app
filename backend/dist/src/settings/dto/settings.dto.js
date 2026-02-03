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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsResponseDto = exports.UpdateSettingsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const decorators_1 = require("@nestjs/swagger/dist/decorators");
class UpdateSettingsDto {
    companyName;
    currency;
    taxRate;
    invoicePrefix;
    printHeader;
    printFooter;
    logoUrl;
}
exports.UpdateSettingsDto = UpdateSettingsDto;
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 'Mi Empresa S.A.S.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "companyName", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "currency", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 19, minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "taxRate", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 'FACT-' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "invoicePrefix", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 'Empresa ABC - Factura #' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "printHeader", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 'Pague en efectivo. Gracias por su compra.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "printFooter", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 'https://example.com/logo.png' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "logoUrl", void 0);
class SettingsResponseDto {
    companyName;
    currency;
    taxRate;
    invoicePrefix;
    printHeader;
    printFooter;
    logoUrl;
}
exports.SettingsResponseDto = SettingsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mi Negocio' }),
    __metadata("design:type", String)
], SettingsResponseDto.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'COP' }),
    __metadata("design:type", String)
], SettingsResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 19 }),
    __metadata("design:type", Number)
], SettingsResponseDto.prototype, "taxRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INV-' }),
    __metadata("design:type", String)
], SettingsResponseDto.prototype, "invoicePrefix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Factura de Venta' }),
    __metadata("design:type", String)
], SettingsResponseDto.prototype, "printHeader", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gracias por su compra' }),
    __metadata("design:type", String)
], SettingsResponseDto.prototype, "printFooter", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 'https://example.com/logo.png' }),
    __metadata("design:type", String)
], SettingsResponseDto.prototype, "logoUrl", void 0);
//# sourceMappingURL=settings.dto.js.map