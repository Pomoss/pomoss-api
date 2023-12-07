// import prisma from "@/lib/prisma";
import builder from "../builder";
import { BasicInterface } from "./common";

export const UserType = builder.prismaObject("User", {
  name: 'User',
  interfaces: [BasicInterface], 
  fields: (t) => ({
    email: t.expose("email", { type: "Email" }),
    username: t.expose("username", { type: "String", nullable: true }),
    profile_image_url: t.exposeString("profile_image_url", { nullable: true }),
    isSignuped: t.boolean({
      resolve: (_, __, { req: { session: {user} } }) => typeof user?.username === 'string',
    }),
  }),
});

builder.queryFields((t) => ({
  getProfile: t.field({
    type: UserType,
    resolve: async (_, __, {req}) => {
      if (!req.session.user) throw new Error('Not user')

      return req.session.user
    }
  })
}))


// builder.mutationFields((t) => ({
//   updateProfile: t.fieldWithInput({
//     type: UserType,
//     input: {
//       username: t.input.string(),
//     },
//     resolve: async (_, { input }, { req: { session: user } }) => {
//       if(user.id){
//         return await prisma.user.update({
//           where: { id: Number(user.id) },
//           data: input,
//         })
//       }
//       throw new Error('Error')
//     }
//   }),
// }));
