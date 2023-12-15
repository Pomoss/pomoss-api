import { writeFileSync } from 'fs';
import { printSchema, lexicographicSortSchema } from 'graphql';
import schema from '@/graphql/schema';

const schemaAsString = printSchema(lexicographicSortSchema(schema));

writeFileSync('schema.graphql', schemaAsString);