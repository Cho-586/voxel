import { generateConstraints } from "./helpers";
import type {
  ArraySchema,
  ArraySchemaOptions,
  BaseSchema,
  BooleanSchema,
  BooleanSchemaOptions,
  EnumSchema,
  EnumSchemaOptions,
  NumberSchema,
  NumberSchemaOptions,
  ObjectSchema,
  PhantomSchema,
  StringSchema,
  StringSchemaOptions,
} from "./types";

export function string<const T = string>(
  options?: StringSchemaOptions<T>,
): StringSchema<T> {
  const { transform, default: d, msg, ...rest } = options ?? {};
  return {
    ...(msg ? { message: msg } : {}),
    ...(d ? { default: d } : {}),
    ...(transform ? { transform } : {}),
    kind: "schema",
    type: "string",
    optional: false,
    constraints: generateConstraints(rest as any),
  };
}

export function number<const T = number>(
  options?: NumberSchemaOptions<T>,
): NumberSchema<T> {
  const { transform, default: d, msg, ...rest } = options ?? {};
  return {
    ...(msg ? { message: msg } : {}),
    ...(d ? { default: d } : {}),
    ...(transform ? { transform } : {}),
    kind: "schema",
    type: "number",
    constraints: generateConstraints(rest),
    optional: false,
  };
}

export function boolean<const T = boolean>(
  options?: BooleanSchemaOptions<T>,
): BooleanSchema<T> {
  const { transform, default: d, msg, ...rest } = options ?? {};
  return {
    ...(msg ? { message: msg } : {}),
    ...(d ? { default: d } : {}),
    ...(transform ? { transform } : {}),
    kind: "schema",
    type: "boolean",
    constraints: generateConstraints(rest),
    optional: false,
  };
}

export function oneOf<const I extends unknown[], const O extends unknown>(
  values: I,
  options?: EnumSchemaOptions<I, O>,
): EnumSchema<I, unknown extends O ? I[number] : O> {
  const { transform, default: d } = options ?? {};
  return {
    ...(d ? { default: d } : {}),
    ...(transform ? { transform } : {}),
    kind: "schema",
    type: "enum",
    values,
    optional: false,
  };
}

export function array<
  const I extends BaseSchema<unknown>,
  const O extends unknown,
>(
  shape: I,
  options?: ArraySchemaOptions<I, O>,
): ArraySchema<I, unknown extends O ? I : O> {
  const { transform, default: d, msg, ...rest } = options ?? {};
  return {
    ...(msg ? { message: msg } : {}),
    ...(d ? { default: d } : {}),
    ...(transform ? { transform } : {}),
    kind: "schema",
    type: "array",
    shape,
    optional: false,
    constraints: generateConstraints(rest),
  } as any;
}

export function object<const T extends Record<string, unknown>>(
  fields: T,
): ObjectSchema<T> {
  return {
    kind: "schema",
    type: "object",
    optional: false,
    fields,
  } as any;
}

export function type<const T extends unknown>(): PhantomSchema<T> {
  return { kind: "schema", type: "phantom", optional: false } as any;
}
