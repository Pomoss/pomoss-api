import 'dotenv/config'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import logger from '@/lib/logger'
import ERROR_CODES from '@/lib/error_codes.json'
import { yoga } from '@/graphql'
/** Firestore */
import { Firestore } from '@google-cloud/firestore';
import { FirestoreStore } from '@google-cloud/connect-firestore';
/** Auth */
import session from 'express-session'
import cors from 'cors'
import grant from 'grant';
import authConfig from '@/lib/authConfig';
import authRouter from '@/routes/auth'

const app = express()
// Authrization
app
  .use(cors({
    origin: [
      process.env.FRONTEND_URL as string,
      process.env.BACKEND_URL as string
    ],
    credentials: true
  }))
  .use(session({
    store: new FirestoreStore({
      dataset: new Firestore(),
      kind: 'express-sessions',
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
  }))
  .use(grant.express(authConfig))
  .use(authRouter)

app.use(yoga.graphqlEndpoint, yoga)

const errorHandler = (err: Error, req: Request, res: Response, _: NextFunction) => {
  // Authrization errors
  if (Object.values(ERROR_CODES.AUTHENTICATION).includes(err.message)) {
    res.status(400).send(err)
  }

  // System errors
  logger.error(err)
  res.status(500).send({ errors: [{ message: ERROR_CODES.SERVER.INTERNAL }] });
}
app.use(errorHandler)

app.listen(process.env.PORT, () => logger.info(`Server is started at port: ${process.env.PORT}`))