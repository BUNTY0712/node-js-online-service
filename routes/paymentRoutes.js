dotenv.config();

import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// Stripe webhook endpoint to handle payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
	event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
	console.error('Webhook signature verification failed:', err.message);
	return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
	const paymentIntent = event.data.object;
	// Expect userId in metadata
	const userId = paymentIntent.metadata && paymentIntent.metadata.userId;
	if (userId) {
	  try {
		await userModel.findByIdAndUpdate(userId, { is_subscribed: true });
		console.log(`User ${userId} subscription activated after payment.`);
	  } catch (err) {
		console.error('Failed to update user subscription:', err);
	  }
	}
  }
  res.json({ received: true });
});

// Create Payment Intent endpoint
router.post('/create-payment-intent', async (req, res) => {
	try {
		const { amount, currency = 'inr', metadata = {} } = req.body;
		if (!amount) {
			return res
				.status(400)
				.json({ success: false, message: 'Amount is required' });
		}
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Stripe expects amount in paise
			currency,
			metadata,
		});
		res.status(200).json({
			success: true,
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.error('Stripe error:', error);
		res
			.status(500)
			.json({
				success: false,
				message: 'Payment intent creation failed',
				error: error.message,
			});
	}
});

export default router;
