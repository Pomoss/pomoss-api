import 'dotenv/config'
import express from 'express'
/** Auth */
import session from 'express-session'
import cors from 'cors'
import grant, { GrantSession } from 'grant';
import authConfig from '@/lib/authConfig';
/** Graphql */
import { createYoga } from "graphql-yoga";
import schema from './graphql/schema';
import prisma from './lib/prisma';
import { User } from '@prisma/client';
/** Firestore */
import { Firestore } from '@google-cloud/firestore';
import { FirestoreStore } from '@google-cloud/connect-firestore';

declare module 'express-session' {
  interface SessionData {
      user: User,
      grant: GrantSession
  }
}

const app = express()
const yoga = createYoga({schema})

const authRouter = express.Router()

// authRouter.get('/auth/email',async (req,res, next) => {})
// authRouter.get('/auth/email/callback',async (req,res, next) => {})
authRouter.get('/auth/logout',async (req, res) => req.session.destroy(() => res.redirect(process.env.FRONTEND_URL || '')))

authRouter.get('/auth/connect/:provider/callback', async (req, res, next) => {
  if(!req.session.grant) return next()
  const profile  = req.session.grant.response?.profile
  if(typeof profile.email === 'string'){
    switch(req.session.grant.provider){
      case 'google':
        const user = await prisma.user.upsert({
          where: {email: profile.email},
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
        res.redirect(process.env.FRONTEND_FAILED_LOGIN_URL || '')
        break;
    }
  }
  res.redirect(process.env.FRONTEND_URL || '')
})

app
  // Auth
  .use(cors())
  .use(session({
    store: new FirestoreStore({
      dataset: new Firestore(),
      kind: 'express-sessions',
    }),
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
  }))
  .use(grant.express(authConfig))
  .use(authRouter)
  // Graphql
  .use(
    yoga.graphqlEndpoint,
    (req, res, next) => {
      if(req.session.user) return next()
      return res.status(400).json('Authentication Error')
    },
    yoga
  )

app.listen(process.env.PORT,() => console.log(`Server is started at port: ${process.env.PORT}`))