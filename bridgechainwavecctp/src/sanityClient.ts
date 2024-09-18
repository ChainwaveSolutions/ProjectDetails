// sanityClient.js
import sanityClient from '@sanity/client';

export const client = sanityClient({
  projectId: 'fhscgjlr',  // Replace with your project ID
  dataset: 'userdatabase',         // Replace with your dataset name
  apiVersion: '2024-09-17',      // Use a recent date to ensure you're using the latest API
  token: process.env.VITE_SANITY_API_TOKEN,  // Use your API token if you're writing or querying private data
  useCdn: false,                  // Set to true for faster, cached reads (false if you're writing data)
});
