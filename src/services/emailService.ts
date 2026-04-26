/**
 * Universal Platform Notification Helper
 * Sends high-priority emails via Google Apps Script bridge.
 */
export const sendPlatformEmail = async (
  payload: { name: string; email: string }, 
  type: 'approve' | 'reject' | 'tutor_register' | 'student_register' | 'booking_confirm', 
  details?: { reason?: string; tutorName?: string; timing?: string; subject?: string }
) => {
  if (!payload.email) return;

  const GAS_URL = "https://script.google.com/macros/s/AKfycbxNMNsfRfPW4r2ItxpcZX1d3Bu6FPMLKH7hkRDhT0wAeOsaaW7uoZAaDuniV26mrNM/exec";

  let subject = "";
  let html = "";

  // Common styles for premium look
  const containerStyle = "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px;";
  const cardStyle = "max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);";
  const bodyStyle = "padding: 40px;";
  const h1Style = "color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;";

  if (type === 'approve') {
    subject = "🎉 Verification Complete – Your Eduqra Journey Starts Now";
    html = `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 35px; text-align: center;">
            <h1 style="${h1Style}">Application Approved</h1>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${payload.name}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">Excellent news! After a thorough review of your demo session and professional records, your account has been <strong>successfully verified</strong> by our administration team.</p>
            
            <div style="margin: 35px 0; text-align: center;">
              <a href="https://eduqra-tutor-dashboard.web.app/login" style="display: inline-block; background: #059669; color: #ffffff; padding: 18px 40px; border-radius: 12px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">Login to Your Dashboard</a>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 25px;">
              <p style="margin: 0 0 15px 0; color: #92400e; font-weight: 800; font-size: 14px; text-transform: uppercase;">🚀 Mandatory Setup Steps:</p>
              <ul style="color: #b45309; font-size: 14px; padding-left: 20px; margin: 0; line-height: 2;">
                <li><strong>Update Profile:</strong> Add your educational background.</li>
                <li><strong>Configure Payouts:</strong> Add your <strong>UPI ID</strong> for earnings.</li>
                <li><strong>Set Fees:</strong> Choose Hourly or Monthly costs.</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8; margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 25px;">Eduqra Team • Empowering Learning Globally</p>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'reject') {
    subject = "Verification Feedback – Path Forward at Eduqra";
    const reapplyLink = `https://eduqra-tutor-dashboard.web.app/reapply?email=${encodeURIComponent(payload.email || '')}`;
    html = `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); padding: 35px; text-align: center;">
            <h1 style="${h1Style}">Application Update</h1>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${payload.name}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">Thank you for sharing your experience. After reviewing your submission, our team has identified specific areas that require adjustment.</p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 25px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #b91c1c; font-weight: 800; font-size: 12px; text-transform: uppercase;">Administrative Feedback:</p>
              <p style="color: #991b1b; margin: 0; font-size: 15px; font-weight: 500;">${details?.reason || "Please ensure your documents are clear and demo video is audible."}</p>
            </div>

            <p style="font-size: 15px; color: #475569; margin-bottom: 30px; text-align: center;">We encourage you to update your profile and try to <strong>re-apply now</strong>.</p>

            <div style="text-align: center; margin-bottom: 40px;">
              <a href="${reapplyLink}" style="display: inline-block; background: #111827; color: #ffffff; padding: 18px 40px; border-radius: 12px; font-weight: 800; text-decoration: none;">Update & Re-apply Now</a>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'student_register') {
    subject = "🚀 Welcome to Eduqra – Your Learning Journey Starts Here!";
    html = `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 35px; text-align: center;">
            <h1 style="${h1Style}">Welcome to Eduqra</h1>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${payload.name}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.8;">
              Welcome to the family! It’s time to <strong>start learning, clearing your doubts, and gaining the knowledge</strong> you need to excel. 
              Our platform is designed to help you <strong>reach your goals</strong> with the guidance of expert mentors.
            </p>
            
            <div style="margin: 35px 0; text-align: center;">
              <a href="https://student-hub.eduqra.com" style="display: inline-block; background: #1e40af; color: #ffffff; padding: 18px 40px; border-radius: 12px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 14px rgba(30, 64, 175, 0.3);">Login to Student Hub</a>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8; margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 25px;">Eduqra Learning Services • Your Future, Personalized</p>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'booking_confirm') {
    subject = "🎉 Booking Confirmed – Get Ready for Your Class!";
    html = `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 35px; text-align: center;">
            <h1 style="${h1Style}">Booking Confirmed</h1>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${payload.name}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">Congratulations! Your payment has been verified and your booking is now <strong>confirmed</strong>.</p>
            
            <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 16px; padding: 25px; margin: 30px 0;">
              <div style="margin-bottom: 12px; border-bottom: 1px solid #ddd6fe; padding-bottom: 12px;">
                <p style="margin: 0; color: #6d28d9; font-size: 12px; font-weight: 800; text-transform: uppercase;">Class Details:</p>
                <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 800;">${details?.subject || 'Tutoring Session'}</p>
              </div>
              <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                  <p style="margin: 0; color: #6d28d9; font-size: 10px; font-weight: 800; text-transform: uppercase;">Tutor:</p>
                  <p style="margin: 2px 0 0 0; color: #1e1b4b; font-size: 14px; font-weight: 600;">${details?.tutorName || 'Your Tutor'}</p>
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0; color: #6d28d9; font-size: 10px; font-weight: 800; text-transform: uppercase;">Timing:</p>
                  <p style="margin: 2px 0 0 0; color: #1e1b4b; font-size: 14px; font-weight: 600;">${details?.timing || 'As per schedule'}</p>
                </div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="https://student-hub.eduqra.com" style="display: inline-block; background: #7c3aed; color: #ffffff; padding: 15px 30px; border-radius: 10px; font-weight: 700; text-decoration: none;">View on Dashboard</a>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    subject = "Welcome to the Eduqra Teaching Network! – Profile Received";
    html = `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <h1 style="${h1Style}">Registration Successful</h1>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">Hello <strong>${payload.name}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">Your registration application has been successfully logged. Our academic review board will evaluate your records within 24 hours.</p>
          </div>
        </div>
      </div>
    `;
  }

  try {
    await fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: payload.email, subject: subject, html: html })
    });
    console.log(`[CLOUD AUTO] ${type} email queued for: ${payload.email}`);
    return { success: true };
  } catch (error) {
    console.error("[CLOUD ERROR]", error);
    return { success: false };
  }
};

/**
 * Legacy compatibility export
 */
export const sendTutorNotification = (tutor: any, type: any, reason?: string) => 
  sendPlatformEmail({ name: tutor.name, email: tutor.email }, type, { reason });
