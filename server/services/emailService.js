import nodemailer from 'nodemailer'

// Create transporter once
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('Email service error:', error.message)
  } else {
    console.log('Email service ready ✅')
  }
})

// Send OTP email
export const sendOTPEmail = async (toEmail, otp, itemTitle) => {
  const mailOptions = {
    from: `"FindIt" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your FindIt verification code — ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0E1A; color: #E2E8F0; padding: 32px; border-radius: 16px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #4F8EF7; font-size: 28px; margin: 0;">FindIt</h1>
          <p style="color: #64748B; font-size: 14px; margin-top: 6px;">Lost & Found Reunification</p>
        </div>

        <h2 style="font-size: 20px; color: #E2E8F0; margin-bottom: 8px;">
          Verify your claim
        </h2>
        <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          You submitted a claim for <strong style="color: #E2E8F0;">${itemTitle}</strong>. 
          Use the OTP below to verify your ownership. 
          This code expires in <strong>10 minutes.</strong>
        </p>

        <div style="background: #1C2539; border: 1px solid #2A3550; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Your verification code</p>
          <h1 style="font-size: 48px; font-weight: bold; color: #4F8EF7; letter-spacing: 12px; margin: 0;">${otp}</h1>
        </div>

        <p style="color: #64748B; font-size: 12px; text-align: center; line-height: 1.6;">
          If you did not submit this claim, ignore this email.<br/>
          Do not share this code with anyone.
        </p>

        <div style="border-top: 1px solid #2A3550; margin-top: 32px; padding-top: 16px; text-align: center;">
          <p style="color: #475569; font-size: 11px; margin: 0;">
            FindIt · Built with MERN + CLIP · Punjabi University Patiala
          </p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
  console.log(`OTP email sent to ${toEmail}`)
}