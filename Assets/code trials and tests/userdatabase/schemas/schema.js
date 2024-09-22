// schemas/schema.js
import createSchema from 'part:@sanity/base/schema-creator';
import schemaTypes from 'all:part:@sanity/base/schema-type';

import user from './user';
import paymentMethod from './paymentMethod';
import transaction from './transaction';
import wallet from './wallet';
import auditLog from './auditLog';
import compliance from './compliance';

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([user, paymentMethod, transaction, wallet, auditLog, compliance]),
});
