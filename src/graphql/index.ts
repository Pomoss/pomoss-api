/** Graphql */
import { createYoga, type YogaInitialContext } from "graphql-yoga";
import schema from '@/graphql/schema';
import type { PrismaClient, User } from '@prisma/client';
import prisma from '@/lib/prisma';
/** Others */
import type { GrantSession } from 'grant';
import type { RedisPubSub } from "graphql-redis-subscriptions";
import {pubsub, redisClient} from '@/lib/redis'


declare module 'express-session' {
    interface SessionData {
        user: User,
        grant: GrantSession
    }
}

export interface YogaExpressContext extends YogaInitialContext {
    req: Express.Request
}

/**
 * All method should be available to call when user is authrized.
 * So context should include user data.
 * Below code is to authrize all user before they call any methods.
 * @link @/graphql/schema/index.ts
 */
export interface Context {
    req: YogaExpressContext['request'] & YogaExpressContext['req'] &  {
        session: YogaExpressContext['req']['session'] & {
            user: User
        }
    }
    prisma: PrismaClient
    redis: typeof redisClient
    pubsub: RedisPubSub
}



export const yoga = createYoga({
    schema, context: (ctx): Context => {
        const { req, request, ...others } = ctx as YogaExpressContext
        const context: Context = {
            ...others,
            req: {
                ...request,
                ...req,
                session: req.session as Context['req']['session']
            },
            prisma,
            redis: redisClient,
            pubsub
        }
        return context
    }
})


