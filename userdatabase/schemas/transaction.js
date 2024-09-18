// schemas/transaction.js
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'transaction',
  title: 'Transaction',
  type: 'document',
  fields: [
    {
      name: 'transactionId',
      title: 'Transaction ID',
      type: 'string',
      readOnly: true,
      initialValue: () => uuidv4(),  // Automatically generates a UUID for each transaction
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'reference',
      to: [{ type: 'user' }],  // Links the transaction to a user
    },
    {
      name: 'transactionType',
      title: 'Transaction Type',
      type: 'string',
      options: {
        list: [
          { title: 'Deposit', value: 'deposit' },
          { title: 'Withdrawal', value: 'withdrawal' },
          { title: 'Buy', value: 'buy' },
          { title: 'Sell', value: 'sell' },
        ],
      },
    },
    {
      name: 'amount',
      title: 'Amount',
      type: 'number',
    },
    {
      name: 'currency',
      title: 'Currency',
      type: 'string',
    },
    {
      name: 'transactionDate',
      title: 'Transaction Date',
      type: 'datetime',
    },
  ],
};
