import { object, string } from "../primitives";
import type { ObjectSchema, StringSchemaOptions } from "../primitives/types";

/* --- Schema extensions --- */
export const date = (
  options: Omit<StringSchemaOptions<Date>, "pattern"> = {},
) =>
  string({
    ...options,
    pattern: [/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid date"],
    transform: (v) => new Date(v),
  });

export const email = (
  options: Omit<StringSchemaOptions<string>, "pattern"> = {},
) =>
  string({
    ...options,
    pattern: [/^[^\s@]+@[^\s@]+\.[^s@]+$/, "Invalid email"],
  });

export const url = (
  options: Omit<StringSchemaOptions<string>, "pattern"> = {},
) => string({ ...options, pattern: [/^https?:\/\/.+/, "Invalid url"] });

export const uuid = (
  options: Omit<StringSchemaOptions<string>, "pattern"> = {},
) =>
  string({
    ...options,
    pattern: [
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      "Invalid uuid",
    ],
  });

/* --- Helper Schemas --- */
export const pick = <
  const T extends ObjectSchema<Record<string, unknown>>,
  const K extends keyof T["fields"],
>(
  schema: T,
  keys: K[],
): ObjectSchema<Pick<T["fields"], K>> => {
  const fields: any = {};
  keys.forEach((k) => {
    if (!!schema.fields[k as any]) {
      fields[k] = schema.fields[k as any];
    }
  });
  return object({ ...fields });
};

export const omit = <
  const T extends ObjectSchema<Record<string, unknown>>,
  const K extends keyof T["fields"],
>(
  schema: T,
  keys: K[],
): ObjectSchema<Omit<T["fields"], K>> => {
  const fields = { ...schema.fields };
  for (const key of keys) {
    delete fields[key as any];
  }
  return object({ ...fields }) as any;
};

export function merge<
  const S1 extends ObjectSchema<Record<string, unknown>>,
  const S2 extends ObjectSchema<Record<string, unknown>>,
>(schema1: S1, schema2: S2): ObjectSchema<S1["fields"] & S2["fields"]> {
  return object({ ...schema1.fields, ...schema2.fields });
}
