import SchemaBuilder from "@pothos/core";
import ERROR_CODES from '@/lib/error_codes.json'
/** Plugins */
import SubscriptionsPlugin, { subscribeOptionsFromIterator } from '@pothos/plugin-smart-subscriptions';
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import WithInputPlugin from "@pothos/plugin-with-input";
import ErrorsPlugin from '@pothos/plugin-errors';

/** Types */
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { PrismaClient, Prisma, User } from "@prisma/client";
import type { Scalars } from "@/graphql/scalars";
import type { Context } from '@/graphql'
import type { GrantSession } from "grant";

declare module 'express-session' {
  interface SessionData {
    user: User,
    grant: GrantSession
  }
}

export interface Builder {
  Context: Context & {
    req: Context['req']
  };
  AuthScopes: {
    isAuthenticated: boolean
  }
  Scalars: Scalars['Scalars'];
  PrismaTypes: PrismaTypes;
}

const prisma = new PrismaClient();

const builder = new SchemaBuilder<Builder>({
  plugins: [
    SubscriptionsPlugin,
    SimpleObjectsPlugin,
    ScopeAuthPlugin,
    PrismaPlugin,
    RelayPlugin,
    WithInputPlugin,
    ErrorsPlugin
  ],
  smartSubscriptions: {
    ...subscribeOptionsFromIterator((name, {pubsub}) => {
      return pubsub.asyncIterator(name);
    }),
    // subscribe: () => { },
    // unsubscribe: () => { },
  },
  authScopes: async ({ req }) => ({
    isAuthenticated: req.session.user !== undefined
  }),
  scopeAuthOptions: {
    authorizeOnSubscribe: true,
    unauthorizedError: () => new Error(ERROR_CODES.AUTHENTICATION.UNAUTHORIZED),
  },
  prisma: {
    client: () => prisma,
    dmmf: Prisma.dmmf,
  },
  relayOptions: {
    // These will become the defaults in the next major version
    clientMutationId: "omit",
    cursorType: "String",
  },
});

export default builder;
