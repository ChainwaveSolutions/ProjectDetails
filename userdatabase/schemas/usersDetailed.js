// schemas/usersDetailed.js
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'usersDetailed',
  title: 'User Detailed Information',
  type: 'document',
  fields: [
    {
      name: 'detailedId',
      title: 'Detailed ID',
      type: 'string',
      readOnly: true,
      initialValue: () => uuidv4(),  // Automatically generates a UUID for each usersDetailed entry
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'reference',
      to: [{ type: 'user' }],  // Links the detailed information to a user
    },
    {
      name: 'documentType',
      title: 'Document Type',
      type: 'string',
      options: {
        list: [
          { title: 'Passport', value: 'passport' },
          { title: 'Driver’s License', value: 'driversLicense' },
          { title: 'National ID', value: 'nationalId' },
        ],
      },
    },
    {
      name: 'documentFront',
      title: 'Document Front',
      type: 'image',
      options: { hotspot: true },  // Allows cropping and focusing on specific areas of the image
      description: 'Upload the front side of the identity document.',
    },
    {
      name: 'documentBack',
      title: 'Document Back',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload the back side of the identity document (if applicable).',
      hidden: ({ document }) => document?.documentType === 'passport',  // Only show this for documents that have a back side (not passports)
    },
    {
      name: 'selfPortrait',
      title: 'Self Portrait',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload a selfie for identity verification.',
    },
    {
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'pending',  // Default status is pending
    },
    {
      name: 'verificationDate',
      title: 'Verification Date',
      type: 'datetime',
      description: 'Date when the verification was completed.',
    },
  ],
};
