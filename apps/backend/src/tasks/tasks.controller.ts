import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.tasksService.findAll(user.clinicId);
  }

  @Get('today')
  findToday(@CurrentUser() user: any) {
    return this.tasksService.findToday(user.clinicId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.tasksService.create(user.sub, user.clinicId, body);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.toggleDone(id, user.clinicId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.remove(id, user.clinicId);
  }
}
