import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { cartItems, total, tax, subtotal, paymentMethodId, customerInfo } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.phone || !customerInfo.name) {
      return NextResponse.json({ error: 'Missing customer info' }, { status: 400 });
    }

    const orderCode = 'HTV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        orderCode: orderCode,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone
      },
      receipt_email: customerInfo.email
    });

    return NextResponse.json({
      success: true,
      orderCode: orderCode,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      message: 'Payment processing'
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}
