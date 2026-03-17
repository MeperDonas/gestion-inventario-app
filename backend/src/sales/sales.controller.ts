import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto } from './dto/sales.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Sales')
@Controller('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Create a new sale' })
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.salesService.create(createSaleDto, req.user.sub);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all sales with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.salesService.findAll(
      page,
      limit,
      startDate,
      endDate,
      status,
      search,
    );
  }

  @Get('number/:saleNumber')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Find sale by sale number' })
  findBySaleNumber(@Param('saleNumber') saleNumber: number) {
    return this.salesService.findBySaleNumber(saleNumber);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a sale by ID' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a sale' })
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.salesService.update(id, updateSaleDto, req.user.sub);
  }

  @Post(':id/receipt')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Generate sale receipt PDF' })
  generateReceipt(@Param('id') id: string, @Res() res: Response) {
    return this.salesService.generateReceipt(id, res);
  }
}
