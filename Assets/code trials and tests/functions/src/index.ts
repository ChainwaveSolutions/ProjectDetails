import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';
import { initializeApp } from 'firebase-admin';

// Initialize Firebase Admin SDK
initializeApp();

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services too
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Trigger to send an email when a new document is created in 'interests' collection
exports.sendEmailOnNewInterest = functions.firestore
  .document('interests/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'recipient-email@example.com',  // Email to send the form submission
        subject: `New Interest Registered: ${data.name}`,
        text: `You have a new interest registration.\n\nName: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
  });
