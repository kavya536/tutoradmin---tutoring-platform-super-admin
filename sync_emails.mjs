import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwXgG11d-FJc1IkRLs9_H7tR6NBIKXDbw",
  authDomain: "tutor-website-c532a.firebaseapp.com",
  projectId: "tutor-website-c532a",
  storageBucket: "tutor-website-c532a.firebasestorage.app",
  messagingSenderId: "925264880105",
  appId: "1:925264880105:web:59a1d97951995179466b78"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncMissingEmails() {
  console.log("🚀 Starting Bulk Email Sync...");
  
  try {
    // 1. Get all rejected tutors
    const snapTutors = await getDocs(query(collection(db, 'tutors'), where("status", "==", "rejected")));
    console.log(`Found ${snapTutors.size} currently rejected tutors.`);

    for (const tutorDoc of snapTutors.docs) {
      const tutor = tutorDoc.data();
      const email = tutor.email;
      
      if (!email) continue;

      // 2. Check if a rejection email was already queued recently
      const qMail = query(collection(db, 'mail'), where("to", "==", email), where("message.subject", "==", "Update Regarding Your Eduqra Tutor Application"));
      const snapMail = await getDocs(qMail);
      
      // Also check legacy subject
      const qMailLegacy = query(collection(db, 'mail'), where("to", "==", email), where("message.subject", "==", "Action Required: Profile Not Approved"));
      const snapMailLegacy = await getDocs(qMailLegacy);

      if (snapMail.empty && snapMailLegacy.empty) {
        console.log(`📤 Sending MISSING rejection email to: ${tutor.name} (${email})`);
        
        const feedback = tutor.rejectionReason || 'Your document verification has failed. Please ensure all uploaded files are clear and valid.';
        const reapplyLink = `https://tutor-website-c532a.web.app/?reapply=true&email=${encodeURIComponent(email)}`;
        
        await addDoc(collection(db, 'mail'), {
          to: email,
          from: "Eduqra Support <support@eduqra.com>",
          message: {
            subject: "Update Regarding Your Eduqra Tutor Application",
            text: `Hello ${tutor.name},\n\nThank you for your interest in joining Eduqra. Unfortunately, your application has not been approved at this time.\n\nReason:\n${feedback}\n\nRe-apply here: ${reapplyLink}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; line-height: 1.6; color: #333;">
                <h2 style="color: #dc2626;">Action Required</h2>
                <p>Hello <strong>${tutor.name}</strong>,</p>
                <p>After reviewing your documents, we have decided not to approve your application in its current state.</p>
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                  <strong>Admin Feedback:</strong><br/>${feedback}
                </div>
                <p>You can re-apply by correcting your profile details:</p>
                <a href="${reapplyLink}" style="background: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Re-apply & Correct Profile</a>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">This is an automated email. Support: support@eduqra.com</p>
              </div>
            `
          }
        });
        console.log(`✅ Queued email for ${email}`);
      } else {
        console.log(`✨ Rejection email already exists for ${email}. Skipping.`);
      }
    }
    
    // 3. Similarly for Approved tutors if they missed the welcome email
    console.log("\n🚀 Checking missing welcome emails for approved tutors...");
    const snapApproved = await getDocs(query(collection(db, 'tutors'), where("status", "==", "approved")));
    
    for (const tutorDoc of snapApproved.docs) {
      const tutor = tutorDoc.data();
      const email = tutor.email;
      if (!email) continue;

      const qMail = query(collection(db, 'mail'), where("to", "==", email), where("message.subject", "==", "Your Eduqra Tutor Profile Has Been Approved!"));
      const snapMail = await getDocs(qMail);
      
      // Legacy welcome email subject
      const qMailLegacy = query(collection(db, 'mail'), where("to", "==", email), where("message.subject", "==", "Your Profile Has Been Approved"));
      const snapMailLegacy = await getDocs(qMailLegacy);

      if (snapMail.empty && snapMailLegacy.empty) {
        console.log(`📤 Sending MISSING welcome email to: ${tutor.name} (${email})`);
        const dashboardLink = "https://tutor-website-c532a.web.app";
        
        await addDoc(collection(db, 'mail'), {
          to: email,
          from: "Eduqra Support <support@eduqra.com>",
          message: {
            subject: "Your Eduqra Tutor Profile Has Been Approved!",
            text: `Hello ${tutor.name},\n\nYour profile has been approved! Login here: ${dashboardLink}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; line-height: 1.6; color: #333;">
                <h2 style="color: #0047ab;">Congratulations!</h2>
                <p>Hello <strong>${tutor.name}</strong>,</p>
                <p>Your tutor profile has been successfully approved. You can now start using the platform.</p>
                <a href="${dashboardLink}" style="background: #0047ab; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Login to Your Dashboard</a>
              </div>
            `
          }
        });
      }
    }
    console.log("\n🏁 Finished processing.");
    
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit();
}

syncMissingEmails();
