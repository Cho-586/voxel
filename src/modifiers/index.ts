import { object } from "../primitives";
import type { BaseSchema, ObjectSchema } from "../primitives/types";

type Optional<S> = S & { optional: true };
type Nullable<S> = S & { nullable: true };
type Partial<S> = { [K in keyof S]: Optional<S[K]> };
type Required<S> = { [K in keyof S]: S[K] & { optional: false } };

export function optional<const S extends BaseSchema<unknown>>(
  schema: S,
): Optional<S> {
  return { ...schema, optional: true };
}

export function nullable<const S extends BaseSchema<unknown>>(
  schema: S,
): Nullable<S> {
  return { ...schema, nullable: true };
}

export function partial<const S extends ObjectSchema<Record<string, unknown>>>(
  schema: S,
): Partial<S> {
  const fields = { ...schema.fields };
  for (const [key, value] of Object.entries(fields) as [string, object][]) {
    fields[key] = { ...value, optional: true };
  }
  return object({ ...fields }) as any;
}

export function required<const S extends ObjectSchema<Record<string, unknown>>>(
  schema: S,
): Required<S> {
  const fields = { ...schema.fields };
  for (const [key, value] of Object.entries(fields) as [string, object][]) {
    fields[key] = { ...value, optional: false };
  }
  return object({ ...fields }) as any;
}
