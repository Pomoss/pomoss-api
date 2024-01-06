import builder from "@/graphql/builder";
import { CHANGED_TIMER_CONTEXT } from "@/lib/pubsub";
import { orm } from "@/lib/redis";
import type { PomodoroTimerContext, PomodoroTimerContextIdParams } from "@/lib/redis";
import ERROR_CODE from '@/lib/error_codes.json'
import { minutesToMilliseconds } from "@/lib/converter";
import prisma from "@/lib/prisma";

const
    getSettings = async (idParams: PomodoroTimerContextIdParams) => {
        const entity_id = Number(idParams.id)
        const entity_type = idParams.type
        const settings = await prisma.pomodoroTimerSettings.upsert({
            where: {
                entity_id_entity_type: {
                    entity_id,
                    entity_type
                }
            },
            create: {
                work_minutes: 25,
                short_break_minutes: 5,
                long_break_minutes: 20,
                auto_start_break: false,
                entity_id,
                entity_type
            },
            update: {}
        })
        return settings
    },
    ModeEnum = builder.enumType('ModeEnum', {
        values: ['work', 'shortBreak', 'longBreak'] as const
    }),
    PomodoroTimerContextType = builder
        .objectRef<PomodoroTimerContext>('PomodoroTimerContext')
        .implement({
            fields: t => ({
                count: t.exposeInt('count', { nullable: false }),
                mode: t.expose('mode', { type: ModeEnum, nullable: false }),
                goal: t.expose('goal', { type: 'DateTime', nullable: true }),
                paused: t.expose('paused', { type: 'DateTime', nullable: true })
            })
        }),
    EntityType = builder.enumType('EntityType', {
        values: ['user', 'group'] as const
    }),
    IdParamsInput = builder
        .inputRef<PomodoroTimerContextIdParams>('IdParamsInput')
        .implement({
            fields: t => ({
                id: t.string({ required: true }),
                type: t.field({ type: EntityType, required: true })
            })
        }),
    PomodoroTimerSettings = builder.prismaObject('PomodoroTimerSettings', {
        fields: t => ({
            id: t.exposeInt('id'),
            work_minutes: t.exposeInt('work_minutes', { nullable: false }),
            short_break_minutes: t.exposeInt('short_break_minutes', { nullable: false }),
            long_break_minutes: t.exposeInt('long_break_minutes', { nullable: false }),
            entity_id: t.exposeInt('entity_id', { nullable: false }),
            entity_type: t.expose('entity_type', { type: EntityType, nullable: false })
        })
    })

builder.queryFields(t => ({
    'getPomodoroTimerContext': t.field({
        args: {
            idParams: t.arg({ type: IdParamsInput, required: true })
        },
        type: PomodoroTimerContextType,
        nullable: true,
        smartSubscription: true,
        subscribe: (subscriptions) => {
            subscriptions.register(CHANGED_TIMER_CONTEXT)
        },
        resolve: async (_, { idParams }) => await orm.PomodoroTimerContext.get(idParams),
        description: `
        This query/subscription is for management of pomodoro timer.
        If you execute mutations like play, pause, expire..., this value should be updated.

        Note
        - You need calculate how many time left on your client app.
        Ex) goal - now
        - You need to execute expire mutation on your client app when the timer countdown expired. If you execute it before expire, this api will return a error
        `
    }),
    getPomodoroTimerSettings: t.field({
        type: PomodoroTimerSettings,
        args: {
            idParams: t.arg({ type: IdParamsInput, required: true })
        },
        nullable: false,
        resolve: async (_, { idParams }) => await getSettings(idParams),
    })
}))

builder.mutationFields(t => ({
    play: t.field({
        type: PomodoroTimerContextType,
        nullable: false,
        args: {
            idParams: t.arg({ type: IdParamsInput, required: true })
        },
        resolve: async (_, { idParams }, { pubsub, prisma }, __) => {
            let pomodoroTimerContext = await orm.PomodoroTimerContext.get(idParams)
            if (pomodoroTimerContext === null) {
                const settings = await getSettings(idParams)
                const initial: PomodoroTimerContext = {
                    count: 0,
                    mode: 'work',
                    goal: new Date(new Date().getTime() + minutesToMilliseconds(settings.work_minutes)),
                    paused: null
                }
                await orm.PomodoroTimerContext.set(idParams, initial)
                pomodoroTimerContext = initial
            }

            const now = new Date()
            const { paused, goal } = pomodoroTimerContext

            // If timer is running
            if (goal !== null && paused === null)
                return pomodoroTimerContext
            // If timer is after paused
            else if (goal !== null && paused !== null) {
                // now + remained
                pomodoroTimerContext.goal = new Date(now.getTime() + (goal.getTime() - paused.getTime()))
                pomodoroTimerContext.paused = null
                // If timer is when it starts
            } else {
                pomodoroTimerContext.goal = new Date()
                pomodoroTimerContext.paused = null
            }

            await orm.PomodoroTimerContext.set(idParams, pomodoroTimerContext)
            await pubsub.publish(CHANGED_TIMER_CONTEXT, pomodoroTimerContext)
            return pomodoroTimerContext
        },
    }),
    pause: t.field({
        type: PomodoroTimerContextType,
        args: {
            idParams: t.arg({ type: IdParamsInput, required: true })
        },
        resolve: async (_, { idParams }, { pubsub }, __) => {
            let PomodoroTimerContext = await orm.PomodoroTimerContext.get(idParams)
            if (PomodoroTimerContext === null) throw new Error(ERROR_CODE.TIMER.CALL_PLAY_FIRST)
            // If timer is paused, return context
            if (PomodoroTimerContext.goal !== null && PomodoroTimerContext.paused !== null)
                return PomodoroTimerContext
            PomodoroTimerContext.paused = new Date()
            await orm.PomodoroTimerContext.set(idParams, PomodoroTimerContext)
            await pubsub.publish(CHANGED_TIMER_CONTEXT, PomodoroTimerContext)
            return PomodoroTimerContext
        }
    }),
    expire: t.field({
        type: PomodoroTimerContextType,
        args: {
            idParams: t.arg({ type: IdParamsInput, required: true })
        },
        resolve: async (_, { idParams }, { pubsub }, __) => {
            let pomodoroTimerContext = await orm.PomodoroTimerContext.get(idParams)
            const now = new Date()
            if (pomodoroTimerContext === null || pomodoroTimerContext.goal === null) throw new Error(ERROR_CODE.TIMER.CALL_PLAY_FIRST)
            if (pomodoroTimerContext.goal.getTime() > now.getTime()) throw new Error(ERROR_CODE.TIMER.IS_NOT_DONE)

            const settings = await getSettings(idParams)
            let next: {
                mode: PomodoroTimerContext['mode'],
                minutes: number,
                count: number
            } = {
                mode: 'work',
                minutes: settings.work_minutes,
                count: pomodoroTimerContext.count
            }

            // If now mode is work, next is break time
            if (pomodoroTimerContext.mode === 'work') {
                next.count += 1
                // Every 4th times of pomodoro, take long break
                if ((pomodoroTimerContext.count % 4) === 3) {
                    next.mode = 'longBreak'
                    next.minutes = settings.long_break_minutes
                }
                else {
                    next.mode = 'shortBreak'
                    next.minutes = settings.short_break_minutes
                }
            }

            const nextPomodoroTimerContext: PomodoroTimerContext = {
                count: next.count,
                mode: next.mode,
                goal: new Date(now.getTime() + minutesToMilliseconds(next.minutes)),
                paused: now
            }
            await orm.PomodoroTimerContext.set(idParams, nextPomodoroTimerContext)
            await pubsub.publish(CHANGED_TIMER_CONTEXT, nextPomodoroTimerContext)
            return nextPomodoroTimerContext
        }
    })
}))


