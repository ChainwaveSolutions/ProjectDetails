// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // Update the origin to match Vite's default port
app.use(express.json());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Endpoint to create a new OnrampSession
app.post('/create-onramp-session', async (req, res) => {
  try {
    const { transaction_details } = req.body;

    const response = await axios.post(
      'https://api.stripe.com/v1/crypto/onramp_sessions',
      new URLSearchParams({
        'transaction_details[destination_currency]': transaction_details.destination_currency,
        'transaction_details[destination_exchange_amount]': transaction_details.destination_exchange_amount,
        'transaction_details[destination_network]': transaction_details.destination_network,
      }),
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    res.json({ clientSecret: response.data.client_secret });
  } catch (error) {
    console.error('Error creating Onramp session:', error.response.data);
    res.status(500).send({ error: error.response.data });
  }
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
