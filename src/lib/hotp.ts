import { hotp } from 'otplib';
import { createHmac, createSecretKey } from 'crypto'
import prisma from '@/lib/prisma';

hotp.options = { digits: 6 };

const HOTP_SECRET = process.env.HOTP_SECRET || 'dev'


/**
 * This function will generate 6 digit OTP token from email and counter of firestore.
 * @param email
 * @returns 6 digit token
 */
export const generate = async (email: string) => {
    // crypto boject cannot reuse, so forget about DRY rule
    const secret = createHmac(
        'sha256',
        createSecretKey(Buffer.from(HOTP_SECRET, 'utf-8'))
    ).update(email).digest('hex')
    const user = await prisma.user.findUniqueOrThrow({where: {email}})
    return hotp.generate(secret, user.hotp_counter)
}
export interface VerifyArgs {
    token: string; // 6 digit
    email: string;
}

/**
 * This function recieve 6 digit OTP token and email.
 * After verifying and succeed to verify, the counter value will be increased.
 * @param args VerifyArgs
 * @returns boolean
 */
export const verify = async ({ token, email }: VerifyArgs) => {
    try {
        // crypto boject cannot reuse, so forget about DRY rule
        const secret = createHmac(
            'sha256',
            createSecretKey(Buffer.from(HOTP_SECRET, 'utf-8'))
        ).update(email).digest('hex')
        const user = await prisma.user.findUnique({where: {email}})
        if (
            (user !== null) &&
            hotp.verify({ token, secret: secret, counter: user.hotp_counter })
        ) {
            await prisma.user.update({where: {id: user.id}, data: {hotp_counter: user.hotp_counter + 1}})
            return true
        }
        throw new Error()
    } catch (err) {
        return false
    }
}

export default {
    generate,
    verify
}