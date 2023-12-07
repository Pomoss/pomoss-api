import builder from "./builder";
// Import definition
import "@/graphql/scalars";
import "@/graphql/defs/common"
import "@/graphql/defs/user";

/**
 * Build Query and Mutation first
 */
builder.queryType({
    description: 'The query root type.',
    fields: t => ({
        helloWorld: t.field({ type: 'String', resolve: () => "Hello World" }),
    }),
});
builder.mutationType({
    description: 'The mutation root type.n',
    fields: t => ({
        helloWorld: t.field({ type: 'String', resolve: () => "Hello World" }),
    }),
});

const schema = builder.toSchema();

export default schema;
