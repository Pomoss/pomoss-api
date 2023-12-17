import { createTransport } from 'nodemailer'
import type { VerifyArgs } from '@/lib/hotp';
import loginHtml from '@/lib/email/login'

const transport = createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    // secureConnection: false, // TLS requires secureConnection to be false
    tls: {
        ciphers: 'SSLv3'
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
        user: process.env.GODADDY_EMAIL,
        pass: process.env.GODADDY_PASSWORD
    }
});

export const sendHOTPEmail = async (options: VerifyArgs) => await transport.sendMail({
    from: process.env.GODADDY_EMAIL,
    to: options.email,
    subject: `Pomoss.com Login`,
    html: loginHtml(options)
})