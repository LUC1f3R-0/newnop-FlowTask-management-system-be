type VerificationOtpMailData = {
  otp: string;
  expiresInMinutes: number;
};

export function buildVerificationOtpMail(data: VerificationOtpMailData) {
  const subject = 'Verify your FlowTask account';

  const text = `Your FlowTask email verification code is ${data.otp}. This code expires in ${data.expiresInMinutes} minutes.`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Verify your FlowTask account</title>
      </head>

      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; padding: 32px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px;">
                      Verify your FlowTask account
                    </h2>

                    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
                      Hello,
                    </p>

                    <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.6;">
                      Use the OTP below to verify your email address.
                    </p>

                    <div style="margin: 24px 0; padding: 18px 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; text-align: center;">
                      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">
                        ${data.otp}
                      </span>
                    </div>

                    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
                      This code expires in <strong>${data.expiresInMinutes} minutes</strong>.
                    </p>

                    <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      If you did not create a FlowTask account, you can safely ignore this email.
                    </p>

                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                      Thanks,<br />
                      FlowTask Team
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return {
    subject,
    html,
    text,
  };
}
