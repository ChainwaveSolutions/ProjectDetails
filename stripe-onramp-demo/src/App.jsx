// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { loadStripeOnramp } from '@stripe/crypto';
import { CryptoElements, OnrampElement } from './StripeCryptoElements';
import './App.css';

// Load the StripeOnramp instance using your publishable key.
const stripeOnrampPromise = loadStripeOnramp(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch an Onramp session and get the client secret
    fetch('http://localhost:4242/create-onramp-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_details: {
          destination_currency: 'usdc',
          destination_exchange_amount: '10.00',
          destination_network: 'ethereum',
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setMessage('Failed to fetch client secret.');
        }
      })
      .catch((error) => {
        console.error('Error fetching client secret:', error);
        setMessage('Error fetching client secret.');
      });
  }, []);

  const onChange = useCallback(({ session }) => {
    setMessage(`OnrampSession is now in ${session.status} state.`);
  }, []);

  return (
    <div className="App">
      <CryptoElements stripeOnramp={stripeOnrampPromise}>
        {clientSecret ? (
          <OnrampElement
            clientSecret={clientSecret}
            appearance={{ theme: 'dark' }}
            onChange={onChange}
          />
        ) : (
          <p>Loading Onramp session...</p>
        )}
      </CryptoElements>
      {message && <div>{message}</div>}
    </div>
  );
}
