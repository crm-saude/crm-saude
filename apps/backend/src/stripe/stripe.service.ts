import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY || '';
    console.log('STRIPE KEY START:', key.substring(0, 30));
    this.stripe = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(clinicId: string, userEmail: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      metadata: { clinicId },
      success_url: `${process.env.FRONTEND_URL}/upgrade/success`,
      cancel_url: `${process.env.FRONTEND_URL}/upgrade/cancel`,
    });
    return session;
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );
    return event;
  }

  get client() {
    return this.stripe;
  }
}
