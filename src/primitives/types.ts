export type BaseSchema<T> = {
  kind: "schema";
  type: T;
  optional: boolean;
  message?: string;
};

export type Constraint<T = number> = T | [T, string];

export type ConstraintObj<T = string> = {
  kind: "constraint";
  type: T;
  name: string;
  value: string | number;
  message?: string;
};

/* --- Schema types --- */
type BaseSchemaOptions<T, K> = {
  msg?: string;
  transform?: (v: T) => K;
};

export type StringSchemaOptions<T> = BaseSchemaOptions<string, T> & {
  minLength?: Constraint;
  maxLength?: Constraint;
  pattern?: Constraint<RegExp>;
  default?: string;
};

export type StringSchema<T = string> = BaseSchema<"string"> &
  Omit<StringSchemaOptions<T>, "minLength" | "maxLength" | "pattern"> & {
    constraints: ConstraintObj[];
  };

export type NumberSchemaOptions<T> = BaseSchemaOptions<number, T> & {
  min?: number;
  max?: number;
  default?: number;
};

export type NumberSchema<T = number> = BaseSchema<"number"> &
  Omit<NumberSchemaOptions<T>, "min" | "max"> & {
    constraints: ConstraintObj[];
  };

export type BooleanSchemaOptions<T> = BaseSchemaOptions<boolean, T> & {
  default?: boolean;
};

export type BooleanSchema<T = boolean> = BaseSchema<"boolean"> &
  BooleanSchemaOptions<T> & {
    constraints: ConstraintObj[];
  };

export type EnumSchemaOptions<
  I extends unknown[],
  O extends unknown,
> = BaseSchemaOptions<I[number], O> & {
  default?: I[number];
};

export type EnumSchema<
  I extends unknown[],
  O extends unknown,
> = BaseSchema<"enum"> & EnumSchemaOptions<I, O> & { values: I };

export type ArraySchemaOptions<
  I extends BaseSchema<unknown>,
  O,
> = BaseSchemaOptions<I, O> & {
  default?: I[];
  maxLength?: Constraint;
  minLength?: Constraint;
};

export type ArraySchema<
  I extends BaseSchema<unknown>,
  O,
> = BaseSchema<"array"> &
  Omit<ArraySchemaOptions<I, O>, "minLength" | "maxLength"> & {
    shape: I;
  };

export type ObjectSchema<T extends Record<string, unknown>> =
  BaseSchema<"object"> & {
    msg: string;
    fields: T;
  };

export type PhantomSchema<T extends unknown> = BaseSchema<"phantom"> & T;

/* --- Infer type helpers --- */
type TypeMap = {
  string: string;
  number: number;
  boolean: boolean;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type RemoveReadonly<T> = T extends Readonly<infer I> ? I : T;

type OptionalKeys<T> = {
  [K in keyof T]: T[K] extends { optional: true } ? K : never;
}[keyof T];

type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>;

export type InferInput<S> =
  S extends BaseSchema<infer T>
    ? T extends keyof TypeMap
      ? TypeMap[T]
      : S extends { type: "enum"; values: infer V extends unknown[] }
        ? V[number]
        : S extends {
              type: "array";
              shape: infer T extends BaseSchema<unknown>;
            }
          ? InferInput<T>[]
          : S extends {
                type: "object";
                fields: infer F extends Record<string, unknown>;
              }
            ? RemoveReadonly<
                {
                  [K in RequiredKeys<F>]: InferInput<F[K]>;
                } & {
                  [K in OptionalKeys<F>]?: InferInput<F[K]>;
                }
              >
            : S extends PhantomSchema<infer T>
              ? T
              : S
    : S;

export type InferOutput<S> = S extends { transform?: infer T }
  ? T extends (...args: any) => any
    ? ReturnType<T>
    : T extends keyof TypeMap
      ? TypeMap[T]
      : T
  : S extends {
        type: "object";
        fields: infer F extends Record<string, unknown>;
      }
    ? RemoveReadonly<
        {
          [K in RequiredKeys<F>]: InferOutput<F[K]>;
        } & {
          [K in OptionalKeys<F>]?: InferOutput<F[K]>;
        }
      >
    : S extends PhantomSchema<infer T>
      ? T
      : S;
