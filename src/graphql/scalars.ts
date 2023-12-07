import builder from "./builder";
import {
  GraphQLDateTime,
  GraphQLURL,
  GraphQLEmailAddress,
} from "graphql-scalars";

interface StringIO {
  Input: string;
  Output: string;
}

export interface Scalars {
  Scalars: {
    URL: {
      Input: URL;
      Output: URL;
    };
    Email: StringIO;
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
}

builder.addScalarType("URL", GraphQLURL, {});
builder.addScalarType("Email", GraphQLEmailAddress, {});
builder.addScalarType("DateTime", GraphQLDateTime, {});
