import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  private checkAdmin(user: any) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Acesso negado');
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    this.checkAdmin(user);
    return this.adminService.getStats();
  }

  @Get('clinics')
  getClinics(@CurrentUser() user: any) {
    this.checkAdmin(user);
    return this.adminService.getClinics();
  }

  @Patch('clinics/:id/plan')
  updatePlan(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { plan: string },
  ) {
    this.checkAdmin(user);
    return this.adminService.updatePlan(id, body.plan);
  }
}
