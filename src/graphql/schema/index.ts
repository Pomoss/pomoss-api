import builder from "@/graphql/builder";
// Import definition
import "@/graphql/scalars";
import "@/graphql/schema/common"
import "@/graphql/schema/models/users";
import "@/graphql/schema/models/pomodoroTimer"

/**
 * Build Query, Mutation and Subscription type first to avoid error
 */
builder.queryType({
    description: 'The query root type.',
    authScopes: { isAuthenticated: true },
    fields: t => ({
        helloWorld: t.field({ type: 'String', resolve: () => "Hello World" }),
    }),
});
builder.mutationType({
    description: 'The mutation root type.',
    authScopes: { isAuthenticated: true },
    fields: t => ({
        helloWorld: t.field({ type: 'String', resolve: () => "Hello World" }),
    }),
});
builder.subscriptionType({
})

builder.objectType(Error, {
    name: 'Error',
    fields: (t) => ({
        message: t.exposeString('message'),
    }),
});

builder.runAuthScopes

const schema = builder.toSchema();

export default schema;
