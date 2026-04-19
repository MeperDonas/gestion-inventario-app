import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { CancelPurchaseOrderDto } from './dto/cancel-purchase-order.dto';
import { QueryPurchaseOrdersDto } from './dto/query-purchase-orders.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('PurchaseOrders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PurchaseOrdersController {
  constructor(private purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Crear una orden de compra (borrador)' })
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.purchaseOrdersService.create(dto, req.user.sub);
  }

  @Get()
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Listar órdenes de compra' })
  findAll(@Query() query: QueryPurchaseOrdersDto) {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Obtener una orden de compra por ID' })
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Editar una orden de compra (solo en borrador)' })
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, dto);
  }

  @Post(':id/confirm')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Confirmar una orden de compra (DRAFT → PENDING)' })
  confirm(@Param('id') id: string) {
    return this.purchaseOrdersService.confirm(id);
  }

  @Post(':id/receive')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Recibir ítems de una orden de compra' })
  receive(
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.purchaseOrdersService.receive(id, dto, req.user.sub);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Cancelar una orden de compra' })
  cancel(@Param('id') id: string, @Body() dto: CancelPurchaseOrderDto) {
    return this.purchaseOrdersService.cancel(id, dto);
  }
}
