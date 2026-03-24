import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditAction } from '../common/decorators/audit.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

interface AuthenticatedRequest {
  user: { sub: string };
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditAction('USER_CREATE')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Put(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('USER_UPDATE')
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.update(req.user.sub, id, updateUserDto);
  }

  @Put(':id/toggle-active')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('USER_UPDATE')
  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  toggleActive(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.usersService.toggleActive(req.user.sub, id);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset a user password (Admin only)' })
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetUserPasswordDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.usersService.resetPassword(req.user.sub, id, dto);
  }

  @Delete(':id')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('USER_DELETE')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.usersService.remove(req.user.sub, id);
  }
}
