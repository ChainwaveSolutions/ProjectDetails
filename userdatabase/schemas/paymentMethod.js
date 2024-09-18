// schemas/paymentMethod.js
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'paymentMethod',
  title: 'Payment Method',
  type: 'document',
  fields: [
    {
      name: 'paymentMethodId',
      title: 'Payment Method ID',
      type: 'string',
      readOnly: true,
      initialValue: () => uuidv4(),  // Automatically generates a UUID for each payment method
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'reference',
      to: [{ type: 'user' }],  // Links the payment method to a user
    },
    {
      name: 'paymentType',
      title: 'Payment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Credit Card', value: 'creditCard' },
          { title: 'Bank Account', value: 'bankAccount' },
        ],
      },
    },
    {
      name: 'cardNumberLast4',
      title: 'Card Number (Last 4)',
      type: 'string',
      hidden: ({ document }) => document?.paymentType !== 'creditCard',  // Only show if payment type is Credit Card
    },
    {
      name: 'bankName',
      title: 'Bank Name',
      type: 'string',
      hidden: ({ document }) => document?.paymentType !== 'bankAccount',  // Only show if payment type is Bank Account
    },
    {
      name: 'accountNumber',
      title: 'Account Number',
      type: 'string',
      hidden: ({ document }) => document?.paymentType !== 'bankAccount',  // Only show if payment type is Bank Account
    },
    {
      name: 'expiryDate',
      title: 'Expiry Date',
      type: 'date',
      hidden: ({ document }) => document?.paymentType !== 'creditCard',  // Only show if payment type is Credit Card
    },
  ],
};
