import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { ExportQueryDto } from './dto/export.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Exports')
@Controller('exports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @Post('sales')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Export sales data' })
  @ApiConsumes('application/json')
  async exportSales(@Body() query: ExportQueryDto, @Res() res: Response) {
    return this.exportsService.exportSales(query, res);
  }

  @Post('products')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Export products data' })
  @ApiConsumes('application/json')
  async exportProducts(@Body() query: ExportQueryDto, @Res() res: Response) {
    return this.exportsService.exportProducts(query, res);
  }

  @Post('customers')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Export customers data' })
  @ApiConsumes('application/json')
  async exportCustomers(@Body() query: ExportQueryDto, @Res() res: Response) {
    return this.exportsService.exportCustomers(query, res);
  }

  @Post('inventory')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Export inventory movements data' })
  @ApiConsumes('application/json')
  async exportInventory(@Body() query: ExportQueryDto, @Res() res: Response) {
    return this.exportsService.exportInventory(query, res);
  }
}
