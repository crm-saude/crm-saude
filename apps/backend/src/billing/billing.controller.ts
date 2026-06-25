import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('billing')
export class BillingController {
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtGuard)
  @Post('checkout')
  async createCheckout(@CurrentUser() user: any) {
    const dbUser = await this.usersService.findById(user.sub);
    const session = await this.stripeService.createCheckoutSession(
      user.clinicId,
      dbUser?.email || '',
    );
    return { url: session.url };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    try {
      const body = req.body as any;
      const eventType = body?.type;

      if (eventType === 'checkout.session.completed') {
        const session = body.data?.object;
        const clinicId = session?.metadata?.clinicId;

        if (clinicId) {
          await this.prisma.db.clinic.update({
            where: { id: clinicId },
            data: { plan: 'CLINIC', stripeCustomerId: session.customer },
          });
        }
      }

      if (eventType === 'customer.subscription.deleted') {
        const subscription = body.data?.object;
        const clinic = await this.prisma.db.clinic.findFirst({
          where: { stripeCustomerId: subscription.customer },
        });
        if (clinic) {
          await this.prisma.db.clinic.update({
            where: { id: clinic.id },
            data: { plan: 'SOLO' },
          });
        }
      }

      return { received: true };
    } catch (err: any) {
      console.error('WEBHOOK ERROR:', err.message);
      return { error: err.message };
    }
  }
}
