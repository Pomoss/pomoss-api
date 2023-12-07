import builder from "@/graphql/builder";

export const BasicInterface = builder.simpleInterface("Basic", {
  fields: (t) => ({
    id: t.int(),
    created_at: t.field({ type: "DateTime" }),
    updated_at: t.field({ type: "DateTime" }),
    deleted: t.boolean(),
  }),
});

export const IDInput = builder.inputRef<{ id: number }>("IDInput").implement({
  fields: (t) => ({
    id: t.int({required: true}),
  }),
});

export type CreateData<
  UncheckedCreateInput,
  Relations,
  OmitList extends string[] = []
> = Omit<
  UncheckedCreateInput,
  | "id"
  | "created_at"
  | "updated_at"
  | "deleted"
  | keyof Relations
  | OmitList[number]
>;
export type UpdateData<
  UncheckedCreateInput,
  Relations,
  OmitList extends string[] = []
> = Omit<
  UncheckedCreateInput,
  "id" | "created_at" | "updated_at" | keyof Relations | OmitList[number]
>;
