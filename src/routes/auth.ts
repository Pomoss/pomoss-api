import { Router } from "express";
import prisma from "@/lib/prisma";

const router = Router()

// router.get('/auth/email',async (req,res, next) => {})
// router.get('/auth/email/callback',async (req,res, next) => {})
router.get('/auth/logout', async (req, res) => req.session.destroy(() => res.redirect(process.env.FRONTEND_URL as string)))

router.get('/auth/connect/:provider/callback', async (req, res, next) => {
    if (!req.session.grant) return next()
    const profile = req.session.grant.response?.profile
    if (typeof profile.email === 'string') {
        switch (req.session.grant.provider) {
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
            default:
                res.redirect(process.env.FRONTEND_FAILED_LOGIN_URL as string)
                break;
        }
    }
    res.redirect(process.env.FRONTEND_URL as string)
})


export default router