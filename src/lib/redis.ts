import { createClient } from "redis";
import logger from "@/lib/logger";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { minutesToMilliseconds } from "./converter";

export const redisClient = createClient({
    url: process.env.REDIS_URL
})

export const pubsub = new RedisPubSub({ connection: process.env.REDIS_URL })

redisClient.connect().catch(logger.error)
redisClient.on("error", logger.error);

/**
 * Below interfaces are types of model for redis
 */
export interface TimerContext {
    context: {
        pomodoroCount: number
        mode: 'work' | 'shortBreak' | 'longBreak'
        goal: Date | null
        paused: Date | null
    }
    settings: {
        work: number,
        shortBreak: number,
        longBreak: number
    }
}
export interface TimerContextIdParams {
    id: string,
    type: 'group' | 'user'
}

// Set as running
export const initialTimerCotext: TimerContext = {
    settings: {
        work: 25,
        shortBreak: 5,
        longBreak: 20
    },
    context: {
        pomodoroCount: 0,
        mode: 'work',
        // goal: new Date(new Date().getTime() + minutesToMilliseconds(25)), // 25 min later
        goal: new Date(new Date().getTime() + 4 * 1000), // 4 secs later
        paused: null
    }
}
export const orm = {
    timerContext: {
        id: (idParams: TimerContextIdParams) =>
            `TimerContext:${idParams.type}:${idParams.id}`,
        set: async (idParams: TimerContextIdParams, data: TimerContext) =>
            await redisClient.setEx(orm.timerContext.id(idParams), 1000, JSON.stringify(data)),
        get: async (idParams: TimerContextIdParams) => {
            const json = await redisClient.get(orm.timerContext.id(idParams))
            if(json === null) return null
            const parsed = JSON.parse(json) as Omit<TimerContext, 'context'> & {
                context: Omit<TimerContext['context'], 'goal' | 'paused'> & {
                    goal: string | null
                    paused: string | null
                }
            }

            const data: TimerContext = {
                ...parsed,
                context: {
                    ...parsed.context,
                    goal: parsed.context.goal? new Date(parsed.context.goal): null,
                    paused: parsed.context.paused? new Date(parsed.context.paused): null,
                }
            }
            return data
        },
    }
}