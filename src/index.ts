import 'dotenv/config'
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import logger from '@/lib/logger'
import ERROR_CODES from '@/lib/error_codes.json'
import { yoga } from '@/graphql'
/** Auth */
import session from 'express-session'
import RedisStore from "connect-redis"
import { redisClient } from '@/lib/redis'
import cors from 'cors'
import grant from 'grant';
import authConfig from '@/lib/authConfig';
import authRouter from '@/routes/auth'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

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
    store: new RedisStore({
      prefix: 'session',
      client: redisClient,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      domain: process.env.SERVICE_DOMAIN,
    },
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
  }))
  .use(grant.express(authConfig))
  .use(authRouter)

app.use(yoga.graphqlEndpoint, yoga)

const errorHandler = (err: Error, _: Request, res: Response, __: NextFunction) => {
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