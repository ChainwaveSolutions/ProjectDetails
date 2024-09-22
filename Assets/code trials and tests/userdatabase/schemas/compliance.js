// schemas/compliance.js
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'compliance',
  title: 'Compliance Check',
  type: 'document',
  fields: [
    {
      name: 'complianceId',
      title: 'Compliance Check ID',
      type: 'string',
      readOnly: true,
      initialValue: () => uuidv4(),  // Automatically generates a UUID for each compliance check
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'reference',
      to: [{ type: 'user' }],  // Links the compliance check to a user
    },
    {
      name: 'riskLevel',
      title: 'Risk Level',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
        ],
      },
    },
    {
      name: 'sanctionsCheck',
      title: 'Sanctions Check',
      type: 'string',
      options: {
        list: [
          { title: 'Clear', value: 'clear' },
          { title: 'Flagged', value: 'flagged' },
        ],
      },
    },
    {
      name: 'pepStatus',
      title: 'PEP Status',
      type: 'string',
      options: {
        list: [
          { title: 'Not a PEP', value: 'notPEP' },
          { title: 'PEP', value: 'pep' },
        ],
      },
    },
    {
      name: 'amlCheckDate',
      title: 'AML Check Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),  // Automatically sets the current date
    },
    {
      name: 'amlVerificationLevel',
      title: 'AML Verification Level',
      type: 'string',
    },
  ],
};
