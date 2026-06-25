import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { PatientsModule } from './patients/patients.module';
import { InteractionsModule } from './interactions/interactions.module';
import { TasksModule } from './tasks/tasks.module';
import { AdminModule } from './admin/admin.module';
import { StripeModule } from './stripe/stripe.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ClinicsModule,
    PatientsModule,
    InteractionsModule,
    TasksModule,
    AdminModule,
    StripeModule,
    BillingModule,
  ],
})
export class AppModule {}
