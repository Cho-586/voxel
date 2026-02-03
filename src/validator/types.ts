import type {
  ArraySchema,
  BaseSchema,
  BooleanSchema,
  EnumSchema,
  NumberSchema,
  ObjectSchema,
  PhantomSchema,
  StringSchema,
} from "../primitives/types";

export type VoxelSchema =
  | StringSchema<any>
  | NumberSchema
  | BooleanSchema
  | EnumSchema<any[], any>
  | ArraySchema<any, any>
  | ObjectSchema<Record<string, unknown>>
  | PhantomSchema<unknown>;

export type VoxelIssue = {
  code: string;
  message: string;
  path: (string | number)[];
  recieved?: unknown;
  expected?: string | number | RegExp;
};

export type VoxelIssueCodes = "invalid_type" | "too_small" | "too_large";
