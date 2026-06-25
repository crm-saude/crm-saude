import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('clinics')
export class ClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.clinicsService.findById(user.clinicId);
  }
}
