import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  UseInterceptors,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateUserDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt.strategy';
import { AuditAction } from '../common/decorators/audit.decorator';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('LOGIN_SUCCESS')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('USER_CREATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getUsers() {
    return this.authService.getUsers();
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('USER_DELETE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  @Put('users/:id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(AuditInterceptor)
  @AuditAction('USER_UPDATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  async toggleUserActive(@Param('id') id: string) {
    return this.authService.toggleUserActive(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: { user: { sub: string } }) {
    return this.authService.validateUser(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.authService.updateProfile(req.user.sub, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: { user: { sub: string } },
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }
}
