import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { StripeModule } from '../stripe/stripe.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    StripeModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [BillingController],
})
export class BillingModule {}
