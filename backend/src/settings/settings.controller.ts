import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get current system settings' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default settings values' })
  getDefaultSettings() {
    return this.settingsService.getDefaultSettings();
  }

  @Put()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.settingsService.updateSettings(req.user.sub, updateSettingsDto);
  }

  @Post('logo')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload company logo' })
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { sub: string } },
  ) {
    return this.settingsService.uploadLogo(req.user.sub, file);
  }
}
