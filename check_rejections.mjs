import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

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

async function checkRecentRejections() {
  console.log("🔍 Checking for recent rejections and emails...");
  console.log("-----------------------------------------");
  
  try {
    // 1. Check for recently rejected tutors
    const tutorsRef = collection(db, 'tutors');
    const qTutors = query(tutorsRef, where("status", "==", "rejected"), limit(5));
    const snapTutors = await getDocs(qTutors);
    
    if (snapTutors.empty) {
      console.log("No rejected tutors found in the last 5 entries.");
      process.exit();
    }
    
    const rejectedTutors = [];
    snapTutors.forEach(doc => {
      const data = doc.data();
      rejectedTutors.push({ id: doc.id, ...data });
      console.log(`❌ Rejected Tutor: ${data.name} (${data.email})`);
    });

    // 2. Check the mail collection for these emails
    console.log("\n📬 Checking mail queue...");
    const mailRef = collection(db, 'mail');
    const emails = rejectedTutors.map(t => t.email);
    
    if (emails.length > 0) {
      const qMail = query(mailRef, where("to", "in", emails), limit(10));
      const snapMail = await getDocs(qMail);
      
      if (snapMail.empty) {
        console.log("⚠️  No emails found in the 'mail' collection for these rejected tutors!");
      } else {
        snapMail.forEach(doc => {
          const data = doc.data();
          const deliveryStatus = data.delivery ? data.delivery.state : "Pending Queue";
          console.log(`✅ Mail Document Found:`);
          console.log(`   └─ To: ${data.to}`);
          console.log(`   └─ Subject: ${data.message.subject}`);
          console.log(`   └─ Status: ${deliveryStatus}`);
        });
      }
    }
  } catch (err) {
    console.error("Error during check:", err);
  }
  process.exit();
}

checkRecentRejections();
