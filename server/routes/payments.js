const express = require('express');
const Stripe = require('stripe');
const Payment = require('../models/Payment');
const { auth, requireRole } = require('../middlewares/auth');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.post('/stripe/create-intent', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: { userId: req.user._id.toString(), type }
    });
    
    const payment = new Payment({
      userId: req.user._id,
      type,
      amount,
      status: 'pending',
      stripePaymentId: paymentIntent.id,
      description
    });
    await payment.save();
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder');
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntent.id },
      { status: 'completed' }
    );
  }
  
  res.json({ received: true });
});

router.post('/chapa/initialize', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const Chapa = require('chapa');
    const { amount, type, description, email } = req.body;
    
    const response = await Chapa.verifyTransaction(process.env.CHAPA_SECRET_KEY || 'placeholder', {
      amount,
      currency: 'ETB',
      email,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      tx_ref: `tx_${Date.now()}`,
      callback_url: process.env.CHAPA_CALLBACK_URL,
      return_url: process.env.CHAPA_RETURN_URL
    });
    
    const payment = new Payment({
      userId: req.user._id,
      type,
      amount,
      currency: 'ETB',
      status: 'pending',
      capaTransactionId: response.data.tx_ref,
      description
    });
    await payment.save();
    
    res.json({ url: response.data.checkout_url });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;