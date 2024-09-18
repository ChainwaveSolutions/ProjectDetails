// schemas/auditLog.js
export default {
  name: 'auditLog',
  title: 'Audit Log',
  type: 'document',
  fields: [
    { name: 'userId', title: 'User ID', type: 'reference', to: [{ type: 'user' }] },
    { name: 'eventType', title: 'Event Type', type: 'string' },
    { name: 'eventTimestamp', title: 'Event Timestamp', type: 'datetime' },
    { name: 'eventDescription', title: 'Event Description', type: 'text' },
    { name: 'eventIpAddress', title: 'Event IP Address', type: 'string' },
  ],
};
