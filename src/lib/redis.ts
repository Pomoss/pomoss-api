import { createClient } from "redis";
import logger from "@/lib/logger";
import { RedisPubSub } from "graphql-redis-subscriptions";

export const redisClient = createClient({
    url: process.env.REDIS_URL
})

export const pubsub = new RedisPubSub({ connection: process.env.REDIS_URL })

redisClient.connect().catch(logger.error)
redisClient.on("error", logger.error);

/**
 * Below interfaces are types of model for redis
 */
export interface PomodoroTimerContext {
    count: number
    mode: 'work' | 'shortBreak' | 'longBreak'
    goal: Date | null
    paused: Date | null
}
export interface PomodoroTimerContextIdParams {
    id: string,
    type: 'group' | 'user'
}

// Set as running
export const orm = {
    PomodoroTimerContext: {
        id: (idParams: PomodoroTimerContextIdParams) =>
            `PomodoroTimerContext:${idParams.type}:${idParams.id}`,
        set: async (idParams: PomodoroTimerContextIdParams, data: PomodoroTimerContext) =>
            await redisClient.setEx(orm.PomodoroTimerContext.id(idParams), 1000, JSON.stringify(data)),
        get: async (idParams: PomodoroTimerContextIdParams) => {
            const json = await redisClient.get(orm.PomodoroTimerContext.id(idParams))
            if (json === null) return null
            const parsed = JSON.parse(json) as Omit<PomodoroTimerContext, 'goal' | 'paused'> & {
                goal: string | null
                paused: string | null
            }

            const data: PomodoroTimerContext = {
                ...parsed,
                goal: parsed.goal ? new Date(parsed.goal) : null,
                paused: parsed.paused ? new Date(parsed.paused) : null,
            }
            return data
        },
    }
}