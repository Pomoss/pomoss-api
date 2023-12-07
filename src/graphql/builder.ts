import SchemaBuilder from "@pothos/core";
import type { Scalars } from "./scalars";
/** Prisma */
import { PrismaClient, Prisma, User } from "@prisma/client";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from '@pothos/plugin-prisma/generated';

import RelayPlugin from "@pothos/plugin-relay";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import WithInputPlugin from "@pothos/plugin-with-input";
import type { YogaInitialContext } from "graphql-yoga";
import { GrantSession } from "grant";
declare module 'express-session' {
  interface SessionData {
      user: User,
      grant: GrantSession
  }
}
export interface  GraphQLContext extends YogaInitialContext{
  req: Express.Request
}

export interface Builder {
  Context: GraphQLContext;
  Scalars: Scalars['Scalars'];
  PrismaTypes: PrismaTypes;
}

const prisma = new PrismaClient();

const builder = new SchemaBuilder<Builder>({
  plugins: [
    RelayPlugin,
    PrismaPlugin,
    SimpleObjectsPlugin,
    WithInputPlugin,
  ],
  relayOptions: {
    // These will become the defaults in the next major version
    clientMutationId: "omit",
    cursorType: "String",
  },
  prisma: {
    client: () => prisma,
    dmmf: Prisma.dmmf,
  },
});

export default builder;
