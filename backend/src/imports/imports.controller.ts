import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ImportsService } from './imports.service';
import { RetryImportRowDto } from './dto/import.dto';

@ApiTags('Imports')
@Controller('imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get('products/template')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Download products import template' })
  async downloadTemplate(@Res() res: any): Promise<void> {
    return this.importsService.downloadTemplate(res);
  }

  @Post('products')
  @Roles('ADMIN', 'INVENTORY_USER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload inventory migration file (.xlsx / .csv)' })
  async startProductsImport(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Request() req: { user: { sub: string } },
  ): Promise<any> {
    return this.importsService.startProductsImport(file, req.user.sub);
  }

  @Get(':jobId/status')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Get import job status for polling' })
  getImportStatus(
    @Param('jobId') jobId: string,
    @Request() req: { user: { sub: string } },
  ): any {
    return this.importsService.getImportStatus(jobId, req.user.sub);
  }

  @Post(':jobId/retry-row')
  @Roles('ADMIN', 'INVENTORY_USER')
  @ApiOperation({ summary: 'Retry a failed row with corrected data' })
  retryImportRow(
    @Param('jobId') jobId: string,
    @Body() dto: RetryImportRowDto,
    @Request() req: { user: { sub: string } },
  ): Promise<any> {
    return this.importsService.retryImportRow(jobId, req.user.sub, dto);
  }
}
