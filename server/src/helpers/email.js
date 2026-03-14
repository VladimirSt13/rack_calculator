import nodemailer from "nodemailer";

/**
 * Створення транспорту для відправки email
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true для 465, false для інших портів
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Відправка email з підтвердженням реєстрації
 * @param {string} email - Email отримувача
 * @param {string} token - Токен підтвердження
 */
export const sendVerificationEmail = async (email, token) => {
  // Якщо SMTP не налаштовано - просто логіруємо токен (для розробки)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] Verification token (dev mode):", token);
    console.log(
      "[Email] Verification link (dev mode):",
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`,
    );
    return { message: "Email sent (dev mode - check console)" };
  }

  const transporter = createTransporter();

  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM || "Rack Calculator"}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Підтвердження реєстрації - Rack Calculator",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin-top: 20px;
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Rack Calculator</h1>
            </div>
            <div class="content">
              <h2>Підтвердження реєстрації</h2>
              <p>Вітаємо! Дякуємо за реєстрацію в системі Rack Calculator.</p>
              <p>Для підтвердження вашого email натисніть на кнопку нижче:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Підтвердити email</a>
              </p>
              <p>Або скопіюйте це посилання у браузер:</p>
              <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
              <p><strong>Увага:</strong> Посилання дійсне протягом 24 годин.</p>
              <p>Якщо ви не реєструвалися в системі, просто проігноруйте цей лист.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Rack Calculator. Всі права захищено.</p>
              <p>Це автоматичний лист, будь ласка, не відповідайте на нього.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Вітаємо! Дякуємо за реєстрацію в системі Rack Calculator.
      
      Для підтвердження вашого email перейдіть за посиланням:
      ${verificationUrl}
      
      Увага: Посилання дійсне протягом 24 годин.
      
      Якщо ви не реєструвалися в системі, просто проігноруйте цей лист.
      
      © ${new Date().getFullYear()} Rack Calculator
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[Email] Verification email sent:", info.messageId);
    return { messageId: info.messageId };
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Відправка email зі скиданням пароля
 * @param {string} email - Email отримувача
 * @param {string} token - Токен скидання пароля
 */
export const sendPasswordResetEmail = async (email, token) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] Password reset token (dev mode):", token);
    return { message: "Email sent (dev mode - check console)" };
  }

  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM || "Rack Calculator"}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Скидання пароля - Rack Calculator",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #EF4444; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🔑 Скидання пароля</h2>
            <p>Ви отримали цей лист, тому що хтось запросив скидання пароля для вашого облікового запису.</p>
            <p>
              <a href="${resetUrl}" class="button">Скинути пароль</a>
            </p>
            <p>Посилання дійсне протягом 1 години.</p>
            <p>Якщо ви не запитували скидання пароля, проігноруйте цей лист.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[Email] Password reset email sent:", info.messageId);
    return { messageId: info.messageId };
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Відправка email з запрошенням (для адміна)
 * @param {string} email - Email отримувача
 * @param {string} tempPassword - Тимчасовий пароль
 */
export const sendInvitationEmail = async (email, tempPassword) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] Invitation (dev mode):", { email, tempPassword });
    return { message: "Email sent (dev mode - check console)" };
  }

  const transporter = createTransporter();

  const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM || "Rack Calculator"}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Запрошення до Rack Calculator",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .credentials { 
              background: #f3f4f6; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: #10B981; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🎉 Запрошення до системи</h2>
            <p>Вас додано до системи Rack Calculator.</p>
            <div class="credentials">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Тимчасовий пароль:</strong> ${tempPassword}</p>
            </div>
            <p>
              <a href="${loginUrl}" class="button">Увійти в систему</a>
            </p>
            <p>Будь ласка, змініть пароль після першого входу.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[Email] Invitation email sent:", info.messageId);
    return { messageId: info.messageId };
  } catch (error) {
    console.error("[Email] Failed to send invitation email:", error);
    throw new Error("Failed to send invitation email");
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvitationEmail,
};
