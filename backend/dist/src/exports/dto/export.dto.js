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
exports.CsvExportDto = exports.ExportQueryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const decorators_1 = require("@nestjs/swagger/dist/decorators");
class ExportQueryDto {
    format;
    type;
    startDate;
    endDate;
    limit;
}
exports.ExportQueryDto = ExportQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['pdf', 'excel', 'csv'], example: 'pdf' }),
    (0, class_validator_1.IsEnum)(['pdf', 'excel', 'csv']),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['sales', 'products', 'customers', 'inventory'],
        example: 'sales',
    }),
    (0, class_validator_1.IsEnum)(['sales', 'products', 'customers', 'inventory']),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "type", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: '2024-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value && value.trim() !== '' ? value : undefined)),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: '2024-01-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value && value.trim() !== '' ? value : undefined)),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, decorators_1.ApiPropertyOptional)({ example: 100 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExportQueryDto.prototype, "limit", void 0);
class CsvExportDto {
    delimiter;
    encoding;
    includeHeaders;
    bom;
}
exports.CsvExportDto = CsvExportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ',' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CsvExportDto.prototype, "delimiter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'utf-8' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CsvExportDto.prototype, "encoding", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'false' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CsvExportDto.prototype, "includeHeaders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'true' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CsvExportDto.prototype, "bom", void 0);
//# sourceMappingURL=export.dto.js.map