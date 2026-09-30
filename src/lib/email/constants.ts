import '@pn-server-only'

import type SMTPPool from 'nodemailer/lib/smtp-pool'


export const DEFAULT_NOTIFICATION_ALIAS = `noreply@${process.env.EMAIL_DOMAIN}`

const port = Number(process.env.MAIL_PORT) || 587
const secure = process.env.MAIL_SECURE === 'true'

// This configuration is only used in production. Otherwise ethereal is used.
export const TRANSPORT_OPTIONS: SMTPPool.Options = {
    pool: true,
    maxConnections: 20, // default is 5, I think sanctus is very fast to maybe this will work :))
    host: process.env.MAIL_SERVER,
    port,
    secure,
    // Only STARTTLS on non-implicit-TLS ports - secure:true (465) already encrypts from connect.
    ...(secure ? {} : { requireTLS: true }),
    ...(process.env.MAIL_USER && process.env.MAIL_PASSWORD ? {
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    } : {}),
}
