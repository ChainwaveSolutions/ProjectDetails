// schemas/wallet.js
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'wallet',
  title: 'Wallet',
  type: 'document',
  fields: [
    {
      name: 'walletId',
      title: 'Wallet ID',
      type: 'string',
      readOnly: true,
      initialValue: () => uuidv4(),  // Automatically generates a UUID for each wallet
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'reference',
      to: [{ type: 'user' }],  // Links the wallet to a user
    },
    {
      name: 'walletAddress',
      title: 'Wallet Address',
      type: 'string',
    },
    {
      name: 'balance',
      title: 'Balance',
      type: 'number',
    },
    {
      name: 'creationDate',
      title: 'Wallet Creation Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),  // Automatically sets the current date
    },
  ],
};
