import { hotp } from 'otplib';
import { createHmac, createSecretKey } from 'crypto'
import hotpCounters from '@/lib/firestore/models/HotpCounters';

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

    const
        counterSnap = await hotpCounters.doc(email).get(),
        counter = counterSnap.data()?.counter

    if (!(counterSnap.exists && counter)) {
        await hotpCounters.doc(email).set({ counter: 0 })
        return hotp.generate(secret, 0)
    }
    return hotp.generate(secret, counter)
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
        const
            counterSnap = await hotpCounters.doc(email).get(),
            counter = counterSnap.data()?.counter
        if (
            (counter !== undefined) &&
            hotp.verify({ token, secret: secret, counter })
        ) {
            await hotpCounters.doc(email).update({ counter: counter + 1 })
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