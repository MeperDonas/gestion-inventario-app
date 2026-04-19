import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySuppliersDto } from './dto/query-suppliers.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Crear un proveedor' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Listar proveedores' })
  findAll(@Query() query: QuerySuppliersDto) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Desactivar un proveedor' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Post(':id/reactivate')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Reactivar un proveedor' })
  reactivate(@Param('id') id: string) {
    return this.suppliersService.reactivate(id);
  }
}
