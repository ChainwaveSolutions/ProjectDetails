// schemaTypes/index.js
import user from '../schemas/user';
import transaction from '../schemas/transaction';
import wallet from '../schemas/wallet';
import paymentMethod from '../schemas/paymentMethod';
import compliance from '../schemas/compliance';
import usersDetailed from '../schemas/usersDetailed';

export const schemaTypes = [user, transaction, wallet, paymentMethod, compliance, usersDetailed];
