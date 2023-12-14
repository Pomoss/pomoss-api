/** Auth */
import type { GrantSession } from 'grant';
/** Graphql */
import { createYoga, type YogaInitialContext } from "graphql-yoga";
import schema from '@/graphql/schema';
import type { User } from '@prisma/client';
import { Context } from 'vm';

declare module 'express-session' {
    interface SessionData {
        user: User,
        grant: GrantSession
    }
}

export interface GraphQLContext extends YogaInitialContext {
    req: Express.Request
}

export const yoga = createYoga({
    schema, context: (ctx) => {
        const { req, request, ...others } = ctx as GraphQLContext
        const context: Context = {
            ...others,
            req: {
                ...request,
                ...req
            }
        }
        return context
    }
})


