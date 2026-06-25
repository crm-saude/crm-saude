import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('interactions')
export class InteractionsController {
  constructor(private interactionsService: InteractionsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.interactionsService.create(user.sub, body);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.interactionsService.findByPatient(patientId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interactionsService.remove(id);
  }
}
