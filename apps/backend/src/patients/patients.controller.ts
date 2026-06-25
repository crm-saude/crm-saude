import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.patientsService.findAll(user.clinicId, status);
  }

  @Get('kanban')
  getKanban(@CurrentUser() user: any) {
    return this.patientsService.getKanban(user.clinicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.findOne(id, user.clinicId);
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    try {
      return await this.patientsService.create(user.clinicId, user.sub, body);
    } catch (e: any) {
      if (e.message === 'LIMIT_REACHED') {
        throw new HttpException(
          'Limite de 10 pacientes atingido. Faça upgrade para continuar.',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      throw e;
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.patientsService.update(id, user.clinicId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.remove(id, user.clinicId);
  }
}
