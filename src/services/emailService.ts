import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Tutor } from '../types';

/**
 * Sends a notification email to a tutor.
 * Triggers the backend SMTP server and logs the action in Firestore.
 */
export const sendTutorNotification = async (tutor: Tutor, type: 'approve' | 'reject' | 'register', reason?: string) => {
  if (!tutor.email) return;

  const GAS_URL = "https://script.google.com/macros/s/AKfycbxNMNsfRfPW4r2ItxpcZX1d3Bu6FPMLKH7hkRDhT0wAeOsaaW7uoZAaDuniV26mrNM/exec";

  let subject = "";
  let html = "";

  if (type === 'approve') {
    subject = "✅ Account Approved – Welcome to Eduqra!";
    html = `<p>Hello <strong>${tutor.name}</strong>,</p><p>Congratulations! Your tutor profile has been verified. You can now log in and start your journey.</p><a href="https://eduqra-tutor-dashboard.web.app/login">Login to Dashboard</a>`;
  } else if (type === 'reject') {
    subject = "⚠️ Application Update – Eduqra";
    html = `<p>Hello ${tutor.name},</p><p>Unfortunately, your application was not approved at this time.</p><p><strong>Feedback:</strong> ${reason || 'Requirements not met.'}</p>`;
  } else {
    subject = "📧 Registration Received – Eduqra";
    html = `<p>Hello ${tutor.name}, Thanks for joining! Your profile is under review.</p>`;
  }

  try {
    // 🚀 ZERO-COST CLOUD AUTOMATION
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: tutor.email,
        subject: subject,
        html: html
      })
    });
    console.log(`[CLOUD AUTO] ${type} email queued for: ${tutor.email}`);
    return { success: true };
  } catch (error) {
    console.error("[CLOUD ERROR]", error);
    return { success: false };
  }
};
