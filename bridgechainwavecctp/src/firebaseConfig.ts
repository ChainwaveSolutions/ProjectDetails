
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCNTIxoc2omZmwCjrDLwaMeIQLHp6m8fYA",
  authDomain: "bridgechainwave.firebaseapp.com",
  projectId: "bridgechainwave",
  storageBucket: "bridgechainwave.appspot.com",
  messagingSenderId: "902274715973",
  appId: "1:902274715973:web:3cd17c9ab4f58dbd53ae2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
