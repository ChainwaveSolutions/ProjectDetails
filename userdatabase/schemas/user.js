// schemas/user.js
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      readOnly: true,
      initialValue: () => uuidv4(),  // Automatically generates a UUID for each user
    },
    {
      name: 'firstName',
      title: 'First Name',
      type: 'string',
    },
    {
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: Rule => Rule.regex(/^.+@.+\..+$/, {
        name: 'email',
      }).error('Please enter a valid email address'),
    },
    {
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'dateOfBirth',
      title: 'Date of Birth',
      type: 'date',
    },
    {
      name: 'profilePicture',
      title: 'Profile Picture',
      type: 'image',
      options: { hotspot: true },
    },
  ],
};
