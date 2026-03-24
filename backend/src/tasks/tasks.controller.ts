import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';

interface AuthenticatedRequest {
  user: {
    sub: string;
    role: 'ADMIN' | 'CASHIER' | 'INVENTORY_USER';
  };
}

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CASHIER', 'INVENTORY_USER')
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a dashboard task' })
  create(@Body() dto: CreateTaskDto, @Request() req: AuthenticatedRequest) {
    return this.tasksService.create(this.toActor(req), dto);
  }

  @Get()
  @ApiOperation({ summary: 'List visible dashboard tasks' })
  findAll(@Query() query: QueryTasksDto, @Request() req: AuthenticatedRequest) {
    return this.tasksService.findAll(this.toActor(req), query);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get immutable timeline for a task' })
  getTimeline(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.getTimeline(id, this.toActor(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.findOne(id, this.toActor(req));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(id, this.toActor(req), dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status and append a timeline event' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.updateStatus(id, this.toActor(req), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a task and append a timeline event' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.remove(id, this.toActor(req));
  }

  private toActor(req: AuthenticatedRequest) {
    return {
      id: req.user.sub,
      role: req.user.role,
    };
  }
}
