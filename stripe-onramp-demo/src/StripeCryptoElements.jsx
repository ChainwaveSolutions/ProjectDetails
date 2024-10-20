// src/StripeCryptoElements.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { loadStripeOnramp } from '@stripe/crypto';

// Create a React context for the StripeOnramp instance
const CryptoElementsContext = React.createContext(null);

export const CryptoElements = ({ stripeOnramp, children }) => {
  const [context, setContext] = useState({ onramp: null });

  useEffect(() => {
    let isMounted = true;

    Promise.resolve(stripeOnramp).then((onramp) => {
      if (onramp && isMounted) {
        setContext({ onramp });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripeOnramp]);

  return (
    <CryptoElementsContext.Provider value={context}>
      {children}
    </CryptoElementsContext.Provider>
  );
};

export const useStripeOnramp = () => {
  const context = useContext(CryptoElementsContext);
  return context?.onramp;
};

export const OnrampElement = ({ clientSecret, appearance, ...props }) => {
  const stripeOnramp = useStripeOnramp();
  const onrampElementRef = useRef(null);

  useEffect(() => {
    if (stripeOnramp && clientSecret) {
      stripeOnramp
        .createSession({ clientSecret, appearance })
        .mount(onrampElementRef.current);
    }
  }, [clientSecret, stripeOnramp]);

  return <div {...props} ref={onrampElementRef} />;
};
