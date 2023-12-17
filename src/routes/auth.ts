/**
 * This file is extended to Grant.js. Configuration of Grant.js is at src/index.ts
 * In this file, all features of authorization should be implamented.
 */
import { Router } from "express";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import hotp from "@/lib/hotp";
import { sendHOTPEmail } from "@/lib/email";

const router = Router()

interface Result {
    succeeded: boolean
}

router.post('/auth/hotp/send', async (req, res) => {
    const email = req.body.email
    let result: Result = { succeeded: true }
    if (typeof email === 'string' && email !== '') {
        const token = await hotp.generate(email)
        await sendHOTPEmail({email, token})
        return res.status(200).json(result)
    }
    result.succeeded = false
    return res.status(200).json(result)
})


router.get('/auth/hotp/verify', async (req, res) => {
    const
        email = req.query.email,
        token = req.query.token
    try{
        if (
            (typeof email === 'string' && email !== '') &&
            (typeof token === 'string' && token !== '')
        ) {
            const verified = await hotp.verify({ email, token })
            if (verified) {
                const user = await prisma.user.upsert({
                    where: { email: email },
                    create: { email: email },
                    update: {}
                })
                req.session.user = user
                return res.redirect(process.env.FRONTEND_URL as string)
            }
        }
        throw new Error()
    }catch(err){
        return res.redirect(process.env.FRONTEND_FAILED_LOGIN_URL as string)
    }
})

router.get('/auth/connect/:provider/callback', async (req, res, next) => {
    const grant = req.session?.grant
    const profile = req.session?.grant?.response?.profile
    if (grant !== undefined && typeof profile.email === 'string') {
        switch (grant.provider) {
            case 'google':
                const user = await prisma.user.upsert({
                    where: { email: profile.email },
                    create: {
                        email: profile.email,
                        profile_image_url: profile.picture || undefined,
                        username: `${profile.given_name} ${profile.family_name}`
                    },
                    update: {}
                })
                req.session.user = user
                break;
        }
        return res.redirect(process.env.FRONTEND_URL as string)
    }
    res.redirect(process.env.FRONTEND_FAILED_LOGIN_URL as string)
})

router.get('/auth/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            logger.error(err)
        } else {
            res.redirect(process.env.FRONTEND_URL as string)
        }
    })
})


export default router