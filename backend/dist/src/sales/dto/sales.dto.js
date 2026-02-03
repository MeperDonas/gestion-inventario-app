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
exports.UpdateSaleDto = exports.CreateSaleDto = exports.PaymentDto = exports.SaleItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SaleItemDto {
    productId;
    quantity;
    unitPrice;
    discountAmount;
}
exports.SaleItemDto = SaleItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-product-id' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SaleItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SaleItemDto.prototype, "discountAmount", void 0);
class PaymentDto {
    method;
    amount;
}
exports.PaymentDto = PaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['CASH', 'CARD', 'TRANSFER'], example: 'CASH' }),
    (0, class_validator_1.IsEnum)(['CASH', 'CARD', 'TRANSFER']),
    __metadata("design:type", String)
], PaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PaymentDto.prototype, "amount", void 0);
class CreateSaleDto {
    customerId;
    items;
    discountAmount;
    payments;
}
exports.CreateSaleDto = CreateSaleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-customer-id', required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SaleItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SaleItemDto),
    __metadata("design:type", Array)
], CreateSaleDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PaymentDto),
    __metadata("design:type", Array)
], CreateSaleDto.prototype, "payments", void 0);
class UpdateSaleDto {
    status;
}
exports.UpdateSaleDto = UpdateSaleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['COMPLETED', 'CANCELLED', 'RETURNED_PARTIAL'],
        example: 'CANCELLED',
        required: false,
    }),
    (0, class_validator_1.IsEnum)(['COMPLETED', 'CANCELLED', 'RETURNED_PARTIAL']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSaleDto.prototype, "status", void 0);
//# sourceMappingURL=sales.dto.js.map